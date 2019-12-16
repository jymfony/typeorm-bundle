import {
    Check,
    Column,
    CreationDate,
    Entity,
    Exclude,
    GeneratedValue,
    Id,
    Index,
    JoinColumn,
    JoinTable,
    MappedSuperclass,
    Relation,
    Table,
    UpdateDate,
    Version,
} from '../../decorators';
import { AlreadyHasActiveConnectionError } from 'typeorm/error/AlreadyHasActiveConnectionError';
import { ConnectionManager as Base } from 'typeorm';
import { parse } from 'url';

const UnderscoreNamingStrategy = Jymfony.Bundle.TypeORMBundle.NamingStrategy.UnderscoreNamingStrategy;
const Connection = Jymfony.Bundle.TypeORMBundle.Connection.Connection;
const EntitySchema = Jymfony.Bundle.TypeORMBundle.Metadata.EntitySchema;

/**
 * @memberOf Jymfony.Bundle.TypeORMBundle.Connection
 */
export default class ConnectionManager extends Base {
    /**
     * Constructor.
     *
     * @param {Object.<string, *>} connections
     * @param {string} defaultConnection
     */
    constructor(connections, defaultConnection) {
        super();

        /**
         * @type {Object<string, *>}
         *
         * @private
         */
        this._connections = connections;

        /**
         * @type {string}
         *
         * @private
         */
        this._defaultConnection = defaultConnection;

        /**
         * @type {Jymfony.Bundle.TypeORMBundle.Logger.Logger}
         *
         * @private
         */
        this._logger = undefined;
    }

    /**
     * Sets the logger for this manager.
     *
     * @param {Jymfony.Bundle.TypeORMBundle.Logger.Logger} logger
     */
    setLogger(logger) {
        this._logger = logger;
    }

    /**
     * @inheritdoc
     */
    has(name) {
        name = name || this._defaultConnection;

        return undefined !== this._connections[name] || super.has(name);
    }

    /**
     * @inheritdoc
     */
    get(name) {
        name = name || this._defaultConnection;
        if (! super.has(name) && undefined !== this._connections[name]) {
            const connection = this._connections[name];
            if (connection.url) {
                const parsed = parse(connection.url);
                connection.driver = __jymfony.rtrim(String(parsed.protocol), ':');

                const auth = parsed.auth ? parsed.auth.match(/^([^:]+)(?::((?:\\@|[^@])+))?$/) : null;
                if (null !== auth) {
                    [ , connection.user, connection.password ] = auth;
                }

                connection.database = 'sqlite' !== connection.driver ? __jymfony.ltrim(parsed.pathname, '/') : parsed.pathname;
                connection.host = parsed.hostname;
                connection.port = parsed.port;
            } else if ('sqlite' === connection.driver) {
                connection.database = connection.database || connection.path;
            }

            const namingStrategy = new UnderscoreNamingStrategy();
            const schemas = [ ...this._getEntitySchemas(name, namingStrategy) ];
            return this.create({
                name,
                type: connection.driver,
                host: connection.host,
                port: connection.port,
                username: connection.user,
                password: connection.password,
                database: connection.database,
                entities: schemas,
                logging: connection.logging,
                logger: this._logger,
                namingStrategy,
            });
        }

        return super.get(name);
    }

    /**
     * @inheritdoc
     */
    create(options) {
        // Check if such connection is already registered
        const existConnection = this.connections.find(connection => connection.name === (options.name || this._defaultConnection));

        if (existConnection) {
            // If connection is registered and its not closed then throw an error
            if (existConnection.isConnected) {
                throw new AlreadyHasActiveConnectionError(options.name || this._defaultConnection);
            }

            // If its registered but closed then simply remove it from the manager
            this.connections.splice(this.connections.indexOf(existConnection), 1);
        }

        // Create a new connection
        const connection = new Connection(options);
        this.connections.push(connection);

        return connection;
    }

    /**
     * Provides the entity schemas.
     *
     * @param {string} name Name of the connection.
     * @param {NamingStrategyInterface} namingStrategy
     *
     * @returns {IterableIterator<Object>}
     *
     * @private
     */
    * _getEntitySchemas(name, namingStrategy) {
        for (const entity of this._connections[name].mappings) {
            if (! ReflectionClass.exists(entity)) {
                continue;
            }

            const reflClass = new ReflectionClass(entity);
            const [ , decorator ] = reflClass.metadata.find(([ t ]) => t === Entity) || [];
            if (decorator) {
                yield * this._loadFromDecorator(reflClass, decorator, namingStrategy);
            } else if (reflClass.hasMethod(Symbol.for('entitySchema'))) {
                yield * this._loadFromEntitySchema(reflClass, namingStrategy);
            }
        }
    }

    /**
     * Generate an EntitySchema object from decorator.
     *
     * @param {ReflectionClass} reflClass
     * @param {Entity} decorator
     * @param {NamingStrategyInterface} namingStrategy
     *
     * @private
     */
    * _loadFromDecorator(reflClass, decorator, namingStrategy) {
        const constructor = reflClass.getConstructor();
        const [ , table ] = reflClass.metadata.find(([ t ]) => t === Table) || [];

        const indices = reflClass.metadata
            .filter(([ t ]) => t === Index)
            .map(([ , index ]) => ({
                name: index.name,
                columns: index.columns,
                synchronize: index.synchronize,
                unique: index.unique,
                spatial: index.spatial,
                fulltext: index.fulltext,
                where: index.where,
            }));

        const checks = reflClass.metadata
            .filter(([ t ]) => t === Check)
            .map(([ , check ]) => ({
                name: check.name,
                expression: check.expression,
            }));

        const exclusions = reflClass.metadata
            .filter(([ t ]) => t === Exclude)
            .map(([ , check ]) => ({
                name: check.name,
                expression: check.expression,
            }));

        let parent = reflClass;
        let columns = this._loadColumns(reflClass, namingStrategy);
        let relations = this._loadRelations(reflClass);
        while ((parent = parent.getParentClass())) {
            const [ , mappedSuperclass ] = parent.metadata.find(([ t ]) => t === MappedSuperclass) || [];
            if (mappedSuperclass) {
                columns = { ...this._loadColumns(parent, namingStrategy) };
                relations = { ...this._loadRelations(parent) };
            } else {
                break;
            }
        }

        yield new EntitySchema({
            columns,
            relations,
            target: constructor,
            extends: decorator.extends,
            name: decorator.name || reflClass.shortName,
            synchronize: decorator.synchronize,
            tableName: namingStrategy.tableName(decorator.name || reflClass.shortName, table ? table.name : undefined),
            database: table ? table.database : undefined,
            schema: table ? table.schema : undefined,
            type: table ? table.type : undefined,
            indices,
            checks,
            exclusions,
            repository: decorator.repository,
        });
    }

    /**
     * @param {ReflectionClass} reflClass
     * @param {NamingStrategyInterface} namingStrategy
     *
     * @private
     */
    _loadColumns(reflClass, namingStrategy) {
        const columns = {};

        for (const field of reflClass.fields) {
            const reflField = reflClass.getField(field);
            const [ , column ] = reflField.metadata.find(([ t ]) => t === Column) || [];
            if (! column) {
                continue;
            }

            const [ , id ] = reflField.metadata.find(([ t ]) => t === Id) || [];
            const [ , generatedValue ] = reflField.metadata.find(([ t ]) => t === GeneratedValue) || [];
            const [ , version ] = reflField.metadata.find(([ t ]) => t === Version) || [];
            const [ , creationDate ] = reflField.metadata.find(([ t ]) => t === CreationDate) || [];
            const [ , updateDate ] = reflField.metadata.find(([ t ]) => t === UpdateDate) || [];

            columns[field] = {
                primary: !! id,
                generatedValue: generatedValue ? generatedValue.strategy : undefined,
                createDate: !! creationDate,
                updateDate: !! updateDate,
                version: !! version,
                type: column.type,
                name: namingStrategy.columnName(field, column.name, []),
                length: column.length,
                nullable: column.nullable,
                unique: column.unique,
                precision: column.precision,
                scale: column.scale,
            };
        }

        return columns;
    }

    /**
     * @param {ReflectionClass} reflClass
     * @param {NamingStrategyInterface} namingStrategy
     *
     * @private
     */
    _loadRelations(reflClass) {
        const relations = {};

        for (const field of reflClass.fields) {
            const reflField = reflClass.getField(field);
            const [ , relation ] = reflField.metadata.find(([ t ]) => t === Relation) || [];
            if (! relation) {
                continue;
            }

            const [ , id ] = reflField.metadata.find(([ t ]) => t === Id) || [];
            const [ , joinColumn ] = reflField.metadata.find(([ t ]) => t === JoinColumn) || [];
            const [ , joinTable ] = reflField.metadata.find(([ t ]) => t === JoinTable) || [];
            const joinColumnOpts = (joinColumn) => ({
                name: joinColumn.name,
                referencedColumnName: joinColumn.referencedColumnName,
            });

            relations[field] = {
                primary: !! id,
                target: relation.target,
                type: relation.type,
                inverseSide: relation.inverse,
                lazy: relation.lazy,
                eager: relation.each,
                joinColumn: joinColumn ? joinColumnOpts(joinColumn) : undefined,
                nullable: joinColumn ? joinColumn.nullable : undefined,
                joinTable: joinTable ? {
                    name: joinTable.name,
                    database: joinTable.database,
                    schema: joinTable.schema,
                    joinColumn: joinTable.joinColumn ? joinColumnOpts(joinTable.joinColumn) : undefined,
                    inverseJoinColumn: joinTable.inverseJoinColumn ? joinColumnOpts(joinTable.inverseJoinColumn) : undefined,
                } : undefined,
            };
        }

        return relations;
    }

    * _loadFromEntitySchema(reflClass) {
        const constructor = reflClass.getConstructor();
        const schema = constructor[Symbol.for('entitySchema')]();
        schema.target = constructor;
        if (! schema.name) {
            schema.name = reflClass.shortName;
        }

        for (const [ key, columnDefinition ] of __jymfony.getEntries(schema.columns || {})) {
            if ('_' === key[0] && undefined === columnDefinition.name) {
                columnDefinition.name = key.substr(1);
            }

            schema.columns[key] = columnDefinition;
        }

        yield new EntitySchema(schema);
    }
}
