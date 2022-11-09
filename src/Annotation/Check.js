const Annotation = Jymfony.Component.Autoloader.Decorator.Annotation;

/**
 * Check decorator.
 *
 * @memberOf Jymfony.Bundle.TypeORMBundle.Annotation
 */
export default
@Annotation(Annotation.ANNOTATION_TARGET_CLASS)
class Check {
    /**
     * Constructor.
     *
     * @param {object|string} [opts]
     * @param {string} [opts.name]
     * @param {string} [opts.expression]
     */
    __construct(opts) {
        if (isString(opts)) {
            opts = { expression: opts };
        }

        /**
         * @type {string}
         *
         * @private
         */
        this._name = opts.name;

        /**
         * @type {string}
         *
         * @private
         */
        this._expression = opts.expression;
    }

    /**
     * Check constraint name.
     *
     * @returns {string}
     */
    get name() {
        return this._name;
    }

    /**
     * Check expression.
     *
     * @returns {string}
     */
    get expression() {
        return this._expression;
    }
}
