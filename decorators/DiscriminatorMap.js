import { @Annotation } from '@jymfony/decorators';

export class DiscriminatorMap {
    __construct(map = {}) {
        /**
         * @type {Object.<string, Function>}
         *
         * @private
         */
        this._map = map;
    }

    /**
     * Gets the discriminator map.
     *
     * @returns {Object<string, Function>}
     */
    get map() {
        return this._map;
    }
}

/**
 * DiscriminatorColumn decorator.
 *
 * @param {Object.<string, Function>} map
 */
export decorator @DiscriminatorMap(map) {
    @Annotation(new DiscriminatorMap(map))
}
