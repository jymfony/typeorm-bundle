const Connection = Jymfony.Bundle.Connection.Connection;
const url = require('url');
const typeorm = require('typeorm');
const Base = typeorm.ConnectionManager;
const { EntitySchema, AlreadyHasActiveConnectionError } = typeorm;

/**
 * @memberOf Jymfony.Bundle.TypeORMBundle.Connection
 */
class ConnectionManager extends Base {
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
                const parsed = url.parse(connection.url);
                connection.driver = __jymfony.rtrim(String(parsed.protocol), ':');

                const auth = parsed.auth ? parsed.auth.match(/^([^:]+):((?:\\@|[^@])+)$/) : null;
                if (null !== auth) {
                    [ , connection.user, connection.password ] = auth;
                }

                connection.database = connection.driver !== 'sqlite' ? __jymfony.ltrim(parsed.pathname, '/') : parsed.pathname;
                connection.host = parsed.hostname;
                connection.port = parsed.port;
            } else if ('sqlite' === connection.driver) {
                connection.database = connection.database || connection.path;
            }

            const schemas = Array.from(this._getEntitySchemas(name));
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
                logger: this._logger
            });
        }

        return super.get(name);
    }

    /**
     * @inheritdoc
     */
    create(options) {
        // check if such connection is already registered
        const existConnection = this.connections.find(connection => connection.name === (options.name || this._defaultConnection));

        if (existConnection) {
            // if connection is registered and its not closed then throw an error
            if (existConnection.isConnected) {
                throw new AlreadyHasActiveConnectionError(options.name || this._defaultConnection);
            }

            // if its registered but closed then simply remove it from the manager
            this.connections.splice(this.connections.indexOf(existConnection), 1);
        }

        // create a new connection
        const connection = new Connection(options);
        this.connections.push(connection);

        return connection;
    }

    /**
     * Provides the entity schemas.
     *
     * @param {string} name Name of the connection.
     *
     * @returns {IterableIterator<Object>}
     *
     * @private
     */
    * _getEntitySchemas(name) {
        for (const entity of this._connections[name].mappings) {
            if (! ReflectionClass.exists(entity)) {
                continue;
            }

            const reflClass = new ReflectionClass(entity);
            if (! reflClass.hasMethod(Symbol.for('entitySchema'))) {
                continue;
            }

            const constructor = reflClass.getConstructor();
            const schema = constructor[Symbol.for('entitySchema')]();
            schema.target = constructor;
            if (! schema.name) {
                schema.name = constructor.name;
            }

            for (const [key, columnDefinition] of __jymfony.getEntries(schema.columns || {})) {
                if (key[0] === '_' && undefined === columnDefinition.name) {
                    columnDefinition.name = key.substr(1);
                }

                schema.columns[key] = columnDefinition;
            }

            for (const relation of Object.values(schema.relations || {})) {
                let target = relation.target;
                if (isFunction(target) && ! ReflectionClass.exists(target)) {
                    target = target();
                }

                if (! isFunction(target)) {
                    continue;
                }

                try {
                    const reflClass = new ReflectionClass(target);
                    relation.target = () => reflClass.getConstructor();
                } catch (e) {
                    // Do nothing
                }
            }

            yield new EntitySchema(schema);
        }
    }
}

module.exports = ConnectionManager;
