const { getConnectionManager } = require('typeorm');

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
     * Gets the Entity Manager for the given connection name.
     *
     * @param {string} name
     *
     * @returns {Promise<EntityManager>}
     */
    async getManager(name = undefined) {
        name = name || this._defaultConnection;
        const connectionManager = getConnectionManager();
        const connection = connectionManager.get(name);

        if (! connection.isConnected) {
            await connection.connect();
        }

        return connection.manager;
    }
}

module.exports = ManagerRegistry;
