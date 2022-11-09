const Annotation = Jymfony.Component.Autoloader.Decorator.Annotation;

/**
 * Discriminator column.
 *
 * @memberOf Jymfony.Bundle.TypeORMBundle.Annotation
 */
export default
@Annotation(Annotation.ANNOTATION_TARGET_CLASS)
class DiscriminatorColumn {
    /**
     * Constructor.
     *
     * @param {object|string} [opts = {}]
     * @param {string} [opts.name]
     * @param {Function|string} [opts.type]
     */
    __construct(opts = {}) {
        if (isString(opts)) {
            opts = { name: opts };
        }

        /**
         * @type {string}
         *
         * @private
         */
        this._name = opts.name || 'discr';

        /**
         * @type {*}
         *
         * @private
         */
        this._type = opts.type || String;
    }

    /**
     * Gets the discriminator column name.
     *
     * @returns {string}
     */
    get name() {
        return this._name;
    }

    /**
     * The discriminator column type.
     * Accepts all the types the @Column decorator accepts, except
     * the embeddable types.
     *
     * @returns {*}
     */
    get type() {
        return this._type;
    }
}
