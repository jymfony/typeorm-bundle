const ConnectionManager = Jymfony.Bundle.TypeORMBundle.Connection.ConnectionManager;
const TypeORMExtension = Jymfony.Bundle.TypeORMBundle.DependencyInjection.TypeORMExtension;
const Bundle = Jymfony.Component.Kernel.Bundle;
const { useContainer } = require('typeorm');

/**
 * Bundle.
 *
 * @memberOf Jymfony.Bundle.TypeORMBundle
 */
class TypeORMBundle extends Bundle {
    /**
     * @inheritdoc
     */
    async boot() {
        useContainer(this._container);
    }

    /**
     * @inheritdoc
     */
    async shutdown() {
        const connectionManager = this._container.get(ConnectionManager);
        for (const connection of connectionManager.connections) {
            if (connection.isConnected) {
                await connection.close();
            }
        }
    }

    /**
     * @inheritdoc
     */
    getContainerExtension() {
        return new TypeORMExtension();
    }
}

module.exports = TypeORMBundle;
