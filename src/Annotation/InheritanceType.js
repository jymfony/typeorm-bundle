const Annotation = Jymfony.Component.Autoloader.Decorator.Annotation;

/**
 * Inheritance type.
 *
 * @memberOf Jymfony.Bundle.TypeORMBundle.Annotation
 */
@Annotation(Annotation.ANNOTATION_TARGET_CLASS)
export default class InheritanceType {
    /**
     * Constructor.
     *
     * @param {string} type
     */
    __construct(type) {
        if ('SINGLE_TABLE' !== type) {
            throw new Exception('The only inheritance type supported is "SINGLE_TABLE". Use mapped superclass if you want to create more than one table.');
        }

        /**
         * @type {string}
         *
         * @private
         */
        this._type = type;
    }

    /**
     * Gets the inheritance type.
     *
     * @returns {string}
     */
    get type() {
        return this._type;
    }
}
