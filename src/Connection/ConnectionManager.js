import { AlreadyHasActiveConnectionError } from 'typeorm/error/AlreadyHasActiveConnectionError';
import { ConnectionManager as Base } from 'typeorm';
import { parse } from 'url';

const UnderscoreNamingStrategy = Jymfony.Bundle.TypeORMBundle.NamingStrategy.UnderscoreNamingStrategy;
const Connection = Jymfony.Bundle.TypeORMBundle.Connection.Connection;
const EntitySchema = Jymfony.Bundle.TypeORMBundle.Metadata.EntitySchema;

const Column = Jymfony.Bundle.TypeORMBundle.Annotation.Column;
const Check = Jymfony.Bundle.TypeORMBundle.Annotation.Check;
const CreationDate = Jymfony.Bundle.TypeORMBundle.Annotation.CreationDate;
const DiscriminatorColumn = Jymfony.Bundle.TypeORMBundle.Annotation.DiscriminatorColumn;
const Exclude = Jymfony.Bundle.TypeORMBundle.Annotation.Exclude;
const Entity = Jymfony.Bundle.TypeORMBundle.Annotation.Entity;
const GeneratedValue = Jymfony.Bundle.TypeORMBundle.Annotation.GeneratedValue;
const Id = Jymfony.Bundle.TypeORMBundle.Annotation.Id;
const InheritanceType = Jymfony.Bundle.TypeORMBundle.Annotation.InheritanceType;
const JoinColumn = Jymfony.Bundle.TypeORMBundle.Annotation.JoinColumn;
const JoinTable = Jymfony.Bundle.TypeORMBundle.Annotation.JoinTable;
const DiscriminatorMap = Jymfony.Bundle.TypeORMBundle.Annotation.DiscriminatorMap;
const Index = Jymfony.Bundle.TypeORMBundle.Annotation.Index;
const MappedSuperclass = Jymfony.Bundle.TypeORMBundle.Annotation.MappedSuperclass;
const Relation = Jymfony.Bundle.TypeORMBundle.Annotation.Relation;
const Table = Jymfony.Bundle.TypeORMBundle.Annotation.Table;
const UpdateDate = Jymfony.Bundle.TypeORMBundle.Annotation.UpdateDate;
const Version = Jymfony.Bundle.TypeORMBundle.Annotation.Version;

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
         * @type {Object.<string, *>}
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
     * Gets all the configured connection names.
     *
     * @returns {string[]}
     */
    get connectionNames() {
        return Object.keys(this._connections);
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
    get(name = undefined) {
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
        const connectionName = options.name || this._defaultConnection;

        // Check if such connection is already registered
        const existConnection = this.connections.find(connection => connection.name === connectionName);
        if (existConnection) {
            // If connection is registered and its not closed then throw an error
            if (existConnection.isInitialized) {
                throw new AlreadyHasActiveConnectionError(connectionName);
            }

            // If its registered but closed then simply remove it from the manager
            this.connectionMap.delete(connectionName);
        }

        // Create a new connection
        const connection = new Connection(options);
        this.connectionMap.set(connectionName, connection);

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
            const decorator = reflClass.getAnnotations(Entity)[0];
            if (decorator) {
                yield * this._loadFromDecorator(reflClass, decorator, namingStrategy);
            } else if ('function' === typeof reflClass.getConstructor()[Symbol.for('entitySchema')]) {
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
        const table = reflClass.getAnnotations(Table)[0];
        let inheritanceType = reflClass.getAnnotations(InheritanceType)[0];
        const discriminatorColumn = reflClass.getAnnotations(DiscriminatorColumn)[0];
        const discriminatorMap = reflClass.getAnnotations(DiscriminatorMap)[0];

        const indices = reflClass.getAnnotations(Index)
            .map(index => ({
                name: index.name,
                columns: index.columns,
                synchronize: index.synchronize,
                unique: index.unique,
                spatial: index.spatial,
                fulltext: index.fulltext,
                where: index.where,
            }));

        const checks = reflClass.getAnnotations(Check)
            .map(check => ({
                name: check.name,
                expression: check.expression,
            }));

        const exclusions = reflClass.getAnnotations(Exclude)
            .map(check => ({
                name: check.name,
                expression: check.expression,
            }));

        let parent = reflClass;
        let columns = this._loadColumns(reflClass, namingStrategy);
        let relations = this._loadRelations(reflClass);
        while ((parent = parent.getParentClass())) {
            const mappedSuperclass = parent.getAnnotations(MappedSuperclass)[0];
            if (! mappedSuperclass) {
                break;
            }

            columns = { ...this._loadColumns(parent, namingStrategy), ...columns };
            relations = { ...this._loadRelations(parent), ...relations };
        }

        inheritanceType = inheritanceType ? inheritanceType.type : undefined;

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
            inheritanceType,
            discriminatorColumn: discriminatorColumn && 'SINGLE_TABLE' === inheritanceType ? {
                type: discriminatorColumn.type,
                name: discriminatorColumn.name,
            } : undefined,
            discriminatorMap: discriminatorMap && 'SINGLE_TABLE' === inheritanceType ? discriminatorMap.map : undefined,
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
            const column = reflField.getAnnotations(Column)[0];
            if (! column) {
                continue;
            }

            const id = reflField.getAnnotations(Id)[0];
            const generatedValue = reflField.getAnnotations(GeneratedValue)[0];
            const version = reflField.getAnnotations(Version)[0];
            const creationDate = reflField.getAnnotations(CreationDate)[0];
            const updateDate = reflField.getAnnotations(UpdateDate)[0];

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
            const relation = reflField.getAnnotations(Relation, true)[0];
            if (! relation) {
                continue;
            }

            const id = reflField.getAnnotations(Id)[0];
            const joinColumn = reflField.getAnnotations(JoinColumn)[0];
            const joinTable = reflField.getAnnotations(JoinTable)[0];
            const joinColumnOpts = (joinColumn) => (joinColumn.name || joinColumn.referencedColumnName ? {
                name: joinColumn.name,
                referencedColumnName: joinColumn.referencedColumnName,
            } : true);

            const lazy = !! relation.lazy;
            relations[field] = {
                primary: !! id,
                target: relation.target,
                type: relation.type,
                inverseSide: relation.inverse,
                isOwning: !relation.inverse,
                lazy: lazy,
                eager: ! lazy,
                joinColumn: joinColumn ? joinColumnOpts(joinColumn) : (relation.inverse ? undefined : {}),
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

    /**
     * @param {ReflectionClass} reflClass
     * @param {NamingStrategyInterface} namingStrategy
     *
     * @returns {Generator<Jymfony.Bundle.TypeORMBundle.Metadata.EntitySchema>}
     *
     * @private
     */
    * _loadFromEntitySchema(reflClass, namingStrategy) {
        const constructor = reflClass.getConstructor();
        const schema = constructor[Symbol.for('entitySchema')]();
        schema.target = constructor;
        if (! schema.name) {
            schema.name = reflClass.shortName;
        }

        for (const [ key, columnDefinition ] of __jymfony.getEntries(schema.columns || {})) {
            const field = '_' === key[0] ? key.substring(1) : key;
            columnDefinition.name = namingStrategy.columnName(field, columnDefinition.name, []);
            schema.columns[key] = columnDefinition;
        }

        for (const [ key, relationDefinition ] of __jymfony.getEntries(schema.relations || {})) {
            const field = '_' === key[0] ? key.substring(1) : key;
            relationDefinition.name = namingStrategy.columnName(field, relationDefinition.name, []);
            switch (relationDefinition.type) {
                case 'one-to-one':
                    relationDefinition.isOwning = !!relationDefinition.joinColumn;
                    break;

                case 'one-to-many':
                    relationDefinition.isOwning = false;
                    break;

                case 'many-to-many':
                case 'many-to-one':
                    relationDefinition.isOwning = true;
                    break;
            }
            schema.relations[key] = relationDefinition;
        }

        yield new EntitySchema(schema);
    }
}
