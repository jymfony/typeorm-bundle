import { @metadata } from '@jymfony/decorators';

export class Relation {
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

/**
 * One-to-one decorator.
 *
 * @param {object|Function} opts
 * @param {Function} [opts.target]
 * @param {boolean} [opts.inverse]
 * @param {boolean} [opts.lazy]
 * @param {boolean} [opts.eager]
 */
export decorator @OneToOne(opts) {
    @metadata(Relation, new Relation(isFunction(opts) ? { target: opts, type: 'one-to-one' } : { ...opts, type: 'one-to-one' }))
}

/**
 * One-to-many decorator.
 *
 * @param {object|Function} opts
 * @param {Function} [opts.target]
 * @param {boolean} [opts.lazy]
 * @param {boolean} [opts.eager]
 */
export decorator @OneToMany(opts) {
    @metadata(Relation, new Relation(isFunction(opts) ?
        { target: opts, type: 'one-to-many', inverse: true } :
        { ...opts, type: 'one-to-many', inverse: true }
    ))
}

/**
 * One-to-many decorator.
 *
 * @param {object|Function} opts
 * @param {Function} [opts.target]
 * @param {boolean} [opts.lazy]
 * @param {boolean} [opts.eager]
 */
export decorator @ManyToOne(opts) {
    @metadata(Relation, new Relation(isFunction(opts) ?
        { target: opts, type: 'many-to-one', inverse: false } :
        { ...opts, type: 'many-to-one', inverse: false }
    ))
}

/**
 * Many-to-many decorator.
 *
 * @param {object|Function} opts
 * @param {Function} [opts.target]
 * @param {boolean} [opts.inverse]
 * @param {boolean} [opts.lazy]
 * @param {boolean} [opts.eager]
 */
export decorator @ManyToMany(opts) {
    @metadata(Relation, new Relation(isFunction(opts) ? { target: opts, type: 'many-to-many' } : { ...opts, type: 'many-to-many' }))
}
