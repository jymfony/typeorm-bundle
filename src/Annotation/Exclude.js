const Annotation = Jymfony.Component.Autoloader.Decorator.Annotation;

/**
 * Exclude constraint.
 *
 * @memberOf Jymfony.Bundle.TypeORMBundle.Annotation
 */
@Annotation(Annotation.ANNOTATION_TARGET_CLASS)
export default class Exclude {
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
     * Exclusion constraint name.
     *
     * @returns {string}
     */
    get name() {
        return this._name;
    }

    /**
     * Exclusion expression.
     *
     * @returns {string}
     */
    get expression() {
        return this._expression;
    }
}
