import { useContainer } from 'typeorm';
const ConnectionManager = Jymfony.Bundle.TypeORMBundle.Connection.ConnectionManager;
const TypeORMExtension = Jymfony.Bundle.TypeORMBundle.DependencyInjection.TypeORMExtension;
const FindOptionsUtils = Jymfony.Bundle.TypeORMBundle.Utils.FindOptionsUtils;
const RawSqlResultsToEntityTransformer = Jymfony.Bundle.TypeORMBundle.Transformer.RawSqlResultsToEntityTransformer;
const Bundle = Jymfony.Component.Kernel.Bundle;

/**
 * Bundle.
 *
 * @memberOf Jymfony.Bundle.TypeORMBundle
 */
export default class TypeORMBundle extends Bundle {
    /**
     * @inheritdoc
     */
    async boot() {
        FindOptionsUtils.patch();
        RawSqlResultsToEntityTransformer.patch();
        useContainer(this._container);
    }

    /**
     * @inheritdoc
     */
    async shutdown() {
        const connectionManager = this._container.get(ConnectionManager);
        for (const connection of connectionManager.connections) {
            if (connection.isInitialized) {
                await connection.destroy();
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
