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
    getContainerExtension() {
        return new TypeORMExtension();
    }
}

module.exports = TypeORMBundle;
