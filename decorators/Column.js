import { @metadata } from '@jymfony/decorators';

export class Column {
    __construct(opts) {
        if (isString(opts) || isFunction(opts)) {
            opts = { type: opts };
        }

        /**
         * @type {string}
         *
         * @private
         */
        this._type = opts.type;

        /**
         * @type {string}
         *
         * @private
         */
        this._name = opts.name;

        /**
         * @type {int|string}
         *
         * @private
         */
        this._length = opts.length;

        /**
         * @type {boolean}
         *
         * @private
         */
        this._nullable = opts.nullable;

        /**
         * @type {boolean}
         *
         * @private
         */
        this._unique = opts.unique;

        /**
         * @type {int}
         *
         * @private
         */
        this._precision = opts.precision;

        /**
         * @type {int}
         *
         * @private
         */
        this._scale = opts.scale;
    }

    /**
     * Column type.
     *
     * @returns {string}
     */
    get type() {
        return this._type;
    }

    /**
     * Column name in the database.
     *
     * @returns {string}
     */
    get name() {
        return this._name;
    }

    /**
     * Column type's length. For example type = "string" and length = 100 means that ORM will create a column with
     * type varchar(100).
     *
     * @returns {int|string}
     */
    get length() {
        return this._length;
    }

    /**
     * Indicates if column's value can be set to NULL.
     *
     * @returns {boolean}
     */
    get nullable() {
        return this._nullable;
    }

    /**
     * Specifies if column's value must be unique or not.
     *
     * @returns {boolean}
     */
    get unique() {
        return this._unique;
    }

    /**
     * The precision for a decimal (exact numeric) column (applies only for decimal column), which is the maximum
     * number of digits that are stored for the values.
     *
     * @returns {int}
     */
    get precision() {
        return this._precision;
    }

    /**
     * The scale for a decimal (exact numeric) column (applies only for decimal column), which represents the number
     * of digits to the right of the decimal point and must not be greater than precision.
     *
     * @returns {int}
     */
    get scale() {
        return this._scale;
    }
}

/**
 * Column decorator.
 *
 * @param {object|string} [opts]
 * @param {string} [opts.type]
 * @param {string} [opts.name]
 * @param {int|string} [opts.length]
 * @param {boolean} [opts.nullable]
 * @param {boolean} [opts.unique]
 * @param {int} [opts.precision]
 * @param {int} [opts.scale]
 */
export decorator @Column(opts = {}) {
    @metadata(Column, new Column(opts))
}
