const Annotation = Jymfony.Component.Autoloader.Decorator.Annotation;

/**
 * Entity.
 *
 * @memberOf Jymfony.Bundle.TypeORMBundle.Annotation
 */
export default
@Annotation(Annotation.ANNOTATION_TARGET_CLASS)
class Entity {
    /**
     * Constructor.
     *
     * @param {object} [opts]
     * @param {string|Function} [opts.extends]
     * @param {string} [opts.name]
     * @param {boolean} [opts.synchronize]
     * @param {string|Function} [opts.repository]
     */
    __construct(opts = {}) {
        /**
         * @type {string|Function}
         *
         * @private
         */
        this._extends = opts.extends;

        /**
         * @type {string}
         *
         * @private
         */
        this._name = opts.name;

        /**
         * @type {boolean}
         *
         * @private
         */
        this._syncronize = opts.synchronize;

        /**
         * @type {string|Function}
         *
         * @private
         */
        this._repository = opts.repository;
    }

    /**
     * Name of the schema it extends.
     *
     * @returns {string}
     */
    get extends() {
        return this._extends;
    }

    /**
     * Entity name.
     *
     * @returns {string}
     */
    get name() {
        return this._name;
    }

    /**
     * Indicates if schema synchronization is enabled or disabled for this entity.
     * If it will be set to false then schema sync will and migrations ignore this entity.
     * By default schema synchronization is enabled for all entities.
     *
     * @returns {boolean}
     */
    get synchronize() {
        return this._syncronize;
    }

    /**
     * The repository class for the current entity.
     *
     * @returns {string|Function}
     */
    get repository() {
        return this._repository;
    }
}
