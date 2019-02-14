const { getConnectionManager, Connection } = require('typeorm');

/**
 * @memberOf Jymfony.Bundle.TypeORMBundle
 */
class ManagerRegistry {
    /**
     * Constructor.
     *
     * @param {string} defaultConnection
     */
    __construct(defaultConnection = 'default') {
        /**
         * @type {string}
         *
         * @private
         */
        this._defaultConnection = defaultConnection;
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
        name = name || this._defaultConnection;
        const connectionManager = getConnectionManager();

        return connectionManager.get(name);
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
