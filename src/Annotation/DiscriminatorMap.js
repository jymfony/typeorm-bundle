const Annotation = Jymfony.Component.Autoloader.Decorator.Annotation;

/**
 * Discriminator map.
 *
 * @memberOf Jymfony.Bundle.TypeORMBundle.Annotation
 */
export default
@Annotation(Annotation.ANNOTATION_TARGET_CLASS)
class DiscriminatorMap {
    /**
     * Constructor.
     *
     * @param {Object.<string, Function>} map
     */
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
