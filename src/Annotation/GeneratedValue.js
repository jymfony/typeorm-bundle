const Annotation = Jymfony.Component.Autoloader.Decorator.Annotation;

/**
 * Generated value.
 *
 * @memberOf Jymfony.Bundle.TypeORMBundle.Annotation
 */
export default
@Annotation(Annotation.ANNOTATION_TARGET_ACCESSOR)
class GeneratedValue {
    /**
     * Constructor.
     *
     * @param {object|boolean|string} [opts]
     * @param {string} [opts.strategy]
     */
    __construct(opts = {}) {
        if (isBoolean(opts)) {
            opts = { strategy: true };
        }

        /**
         * @type {boolean|string}
         *
         * @private
         */
        this._strategy = opts.strategy;
    }

    /**
     * Specifies the strategy to use while generating value for this column.
     *
     * @returns {boolean|string}
     */
    get strategy() {
        return this._strategy;
    }
}
