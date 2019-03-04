const { Connection } = require('typeorm');

/**
 * @memberOf Jymfony.Bundle.TypeORMBundle
 */
class ManagerRegistry {
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
     * Gets the Entity Manager for the given connection name.
     *
     * @param {string} name
     *
     * @returns {Promise<EntityManager>}
     */
    async getManager(name = undefined) {
        const connection = this.getConnection(name);
        if (! connection.isConnected) {
            await connection.connect();
        }

        return connection.manager;
    }
}

module.exports = ManagerRegistry;
