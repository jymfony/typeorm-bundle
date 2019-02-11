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
}

module.exports = TypeORMBundle;
