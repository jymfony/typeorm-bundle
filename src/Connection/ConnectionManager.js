const LoggerAwareInterface = Jymfony.Component.Logger.LoggerAwareInterface;
const LoggerAwareTrait = Jymfony.Component.Logger.LoggerAwareTrait;

const typeorm = require('typeorm');
const Base = typeorm.ConnectionManager;
const EntitySchema = typeorm.EntitySchema;

/**
 * @memberOf Jymfony.Bundle.TypeORMBundle.Connection
 */
class ConnectionManager extends mix(Base, LoggerAwareInterface, LoggerAwareTrait) {
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
            const schemas = Array.from(this._getEntitySchemas(name));

            const con = this.create({
                name,
                type: connection.driver,
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

            yield new EntitySchema(schema);
        }
    }
}

module.exports = ConnectionManager;
