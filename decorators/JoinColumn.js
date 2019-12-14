import { @metadata } from '@jymfony/decorators';

export class JoinColumn {
    __construct(opts = {}) {
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
        this._referencedColumnName = opts.referencedColumnName;

        /**
         * @type {boolean}
         *
         * @private
         */
        this._nullable = opts.nullable;
    }

    /**
     * Name of the column.
     *
     * @returns {string}
     */
    get name() {
        return this._name;
    }

    /**
     * Name of the column in the entity to which this column is referenced.
     *
     * @returns {string}
     */
    get referencedColumnName() {
        return this._referencedColumnName;
    }

    /**
     * Indicates if relation column value can be nullable or not.
     *
     * @returns {boolean}
     */
    get nullable() {
        return this._nullable;
    }
}

/**
 * JoinColumn decorator.
 *
 * @param {object} [opts]
 * @param {string} [opts.name]
 * @param {string} [opts.referencedColumnName]
 * @param {boolean} [opts.nullable]
 */
export decorator @JoinColumn(opts = {}) {
    @metadata(JoinColumn, new JoinColumn(opts))
}
