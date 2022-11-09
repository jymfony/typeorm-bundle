const Annotation = Jymfony.Component.Autoloader.Decorator.Annotation;

/**
 * Join Table.
 *
 * @memberOf Jymfony.Bundle.TypeORMBundle.Annotation
 */
@Annotation(Annotation.ANNOTATION_TARGET_ACCESSOR)
export default class JoinTable {
    /**
     * Constructor.
     *
     * @param {object} [opts]
     * @param {string} [opts.name]
     * @param {string} [opts.database]
     * @param {string} [opts.schema]
     * @param {JoinColumn} [opts.joinColumn]
     * @param {JoinColumn} [opts.inverseJoinColumn]
     */
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
        this._database = opts.database;

        /**
         * @type {string}
         *
         * @private
         */
        this._schema = opts.schema;

        /**
         * @type {JoinColumn}
         *
         * @private
         */
        this._joinColumn = opts.joinColumn;

        /**
         * @type {JoinColumn}
         *
         * @private
         */
        this._inverseJoinColumn = opts.inverseJoinColumn;
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
     * Database where join table will be created.
     * Works only in some databases (like mysql and mssql).
     *
     * @returns {string}
     */
    get database() {
        return this._database;
    }

    /**
     * Schema where join table will be created.
     * Works only in some databases (like postgres and mssql).
     *
     * @returns {string}
     */
    get schema() {
        return this._schema;
    }

    /**
     * First column of the join table.
     *
     * @returns {JoinColumn}
     */
    get joinColumn() {
        return this._joinColumn;
    }

    /**
     * Second (inverse) column of the join table.
     *
     * @returns {JoinColumn}
     */
    get inverseJoinColumn() {
        return this._inverseJoinColumn;
    }
}
