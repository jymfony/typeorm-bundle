/**
 * @memberOf Jymfony.Bundle.TypeORMBundle
 */
export default class ManagerRegistry {
    /**
     * Constructor.
     *
     * @param {Jymfony.Bundle.TypeORMBundle.Connection.ConnectionManager} connectionManager
     */
    __construct(connectionManager) {
        /**
         * @type {Jymfony.Bundle.TypeORMBundle.Connection.ConnectionManager}
         *
         * @private
         */
        this._connectionManager = connectionManager;
    }

    /**
     * Gets the connection for the given connection name.
     * NOTE: connection is not guaranteed to be connected.
     *
     * @param {string} name
     *
     * @returns {Connection}
     */
    getConnection(name = undefined) {
        return this._connectionManager.get(name);
    }

    /**
     * Gets the correct Entity Manager for the given entity class.
     *
     * @param {Newable|string} entityClass
     *
     * @returns {null|Promise<EntityManager>}
     */
    getManagerFor(entityClass) {
        try {
            entityClass = ReflectionClass.getClass(entityClass);
        } catch (e) {
            // Leave entityClass untouched.
        }

        for (const name of this._connectionManager.connectionNames) {
            const connection = this.getConnection(name);
            if (connection.hasMetadata(entityClass)) {
                return this.getManager(name);
            }
        }

        return null;
    }

    /**
     * Gets the Entity Manager for the given connection name.
     *
     * @param {string} name
     *
     * @returns {Promise<EntityManager>}
     */
    async getManager(name = undefined) {
        const connection = this.getConnection(name);
        if (! connection.isInitialized) {
            await connection.initialize();
        }

        return connection.manager;
    }

    /**
     * Gets the metadata for given target.
     *
     * @param {Function|EntitySchema|string} target
     *
     * @returns {null|EntityMetadata}
     */
    getMetadataFor(target) {
        for (const name of this._connectionManager.connectionNames) {
            const connection = this.getConnection(name);
            if (connection.hasMetadata(target)) {
                return connection.getMetadata(target);
            }
        }

        return null;
    }
}
