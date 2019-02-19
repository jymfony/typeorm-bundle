const url = require('url');
const typeorm = require('typeorm');
const Base = typeorm.ConnectionManager;
const EntitySchema = typeorm.EntitySchema;

/**
 * @memberOf Jymfony.Bundle.TypeORMBundle.Connection
 */
class ConnectionManager extends Base {
    /**
     * Constructor.
     *
     * @param {Object.<string, *>} connections
     */
    constructor(connections) {
        super();

        /**
         * @type {Object<string, *>}
         *
         * @private
         */
        this._connections = connections;

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
        return undefined !== this._connections[name] || super.has(name);
    }

    /**
     * @inheritdoc
     */
    get(name) {
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
            const con = this.create({
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

            con.buildMetadatas();
        }

        return super.get(name);
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

            yield new EntitySchema(schema);
        }
    }
}

module.exports = ConnectionManager;
