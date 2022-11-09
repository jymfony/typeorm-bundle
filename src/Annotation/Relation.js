/**
 * Relation.
 *
 * @memberOf Jymfony.Bundle.TypeORMBundle.Annotation
 * @abstract
 */
export default class Relation {
    /**
     * Constructor.
     *
     * @param {object|Function} opts
     * @param {Function} [opts.target]
     * @param {boolean} [opts.inverse]
     * @param {boolean} [opts.lazy]
     * @param {boolean} [opts.eager]
     * @param {string} [opts.type]
     */
    __construct(opts = {}) {
        /**
         * @type {Function}
         *
         * @private
         */
        this._target = opts.target;

        /**
         * @type {string}
         *
         * @private
         */
        this._type = opts.type;

        /**
         * @type {boolean}
         *
         * @private
         */
        this._inverse = opts.inverse;

        /**
         * @type {boolean}
         *
         * @private
         */
        this._lazy = opts.lazy;
    }

    /**
     * Indicates with which entity this relation is made.
     *
     * @returns {Function}
     */
    get target() {
        return this._target;
    }

    /**
     * Type of relation.
     *
     * @returns {string}
     */
    get type() {
        return this._type;
    }

    /**
     * Inverse side of the relation.
     *
     * @returns {boolean}
     */
    get inverse() {
        return this._inverse;
    }

    /**
     * Indicates if this relation will be lazily loaded.
     *
     * @returns {boolean}
     */
    get lazy() {
        return this._lazy;
    }
}
