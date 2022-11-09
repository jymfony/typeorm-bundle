const Annotation = Jymfony.Component.Autoloader.Decorator.Annotation;

/**
 * Index.
 *
 * @memberOf Jymfony.Bundle.TypeORMBundle.Annotation
 */
export default
@Annotation(Annotation.ANNOTATION_TARGET_CLASS)
class Index {
    /**
     * Constructor.
     *
     * @param {object|string[]} [opts]
     * @param {string} [opts.name]
     * @param {string[]} [opts.columns]
     * @param {boolean} [opts.synchronize]
     * @param {boolean} [opts.unique]
     * @param {boolean} [opts.spatial]
     * @param {boolean} [opts.fulltext]
     * @param {string} [opts.where]
     */
    __construct(opts) {
        if (isArray(opts)) {
            opts = { columns: opts };
        }

        /**
         * @type {string}
         *
         * @private
         */
        this._name = opts.name;

        /**
         * @type {string[]}
         *
         * @private
         */
        this._columns = opts.columns;

        /**
         * @type {boolean}
         *
         * @private
         */
        this._syncronize = opts.synchronize;

        /**
         * @type {boolean}
         *
         * @private
         */
        this._unique = opts.unique;

        /**
         * @type {boolean}
         *
         * @private
         */
        this._spatial = opts.spatial;

        /**
         * @type {boolean}
         *
         * @private
         */
        this._fulltext = opts.fulltext;

        /**
         * @type {string}
         *
         * @private
         */
        this._where = opts.where;
    }

    /**
     * Index name.
     *
     * @returns {string}
     */
    get name() {
        return this._name;
    }

    /**
     * Index column names.
     *
     * @returns {string[]}
     */
    get columns() {
        return this._columns;
    }

    /**
     * Indicates if index must sync with database index.
     *
     * @returns {boolean}
     */
    get synchronize() {
        return this._syncronize;
    }

    /**
     * Indicates if this index must be unique or not.
     *
     * @returns {boolean}
     */
    get unique() {
        return this._unique;
    }

    /**
     * The SPATIAL modifier indexes the entire column and does not allow indexed columns to contain NULL values.
     * Works only in MySQL and PostgreSQL.
     *
     * @returns {boolean}
     */
    get spatial() {
        return this._spatial;
    }

    /**
     * The FULLTEXT modifier indexes the entire column and does not allow prefixing.
     * Works only in MySQL.
     *
     * @returns {boolean}
     */
    get fulltext() {
        return this._fulltext;
    }

    /**
     * Index filter condition.
     *
     * @returns {string}
     */
    get where() {
        return this._where;
    }
}
