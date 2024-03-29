const Annotation = Jymfony.Component.Autoloader.Decorator.Annotation;

/**
 * Table.
 *
 * @memberOf Jymfony.Bundle.TypeORMBundle.Annotation
 */
export default
@Annotation(Annotation.ANNOTATION_TARGET_CLASS)
class Table {
    /**
     * Constructor.
     *
     * @param {object|string} [opts]
     * @param {string} [opts.name]
     * @param {string} [opts.database]
     * @param {string} [opts.schema]
     * @param {"regular" | "view" | "junction" | "closure" | "closure-junction" | "entity-child"} [opts.type]
     */
    __construct(opts) {
        if (isString(opts)) {
            opts = { name: opts };
        }

        /**
         * Table name.
         *
         * @type {string}
         *
         * @private
         */
        this._name = opts.name;

        /**
         * Database name. Used in MySql and Sql Server.
         *
         * @type {string}
         *
         * @private
         */
        this._database = opts.database;

        /**
         * Schema name. Used in Postgres and Sql Server.
         *
         * @type {string}
         *
         * @private
         */
        this._schema = opts.schema;

        /**
         * Table type.
         *
         * @type {string}
         *
         * @private
         */
        this._type = opts.type;
    }

    /**
     * Table name.
     *
     * @returns {string}
     */
    get name() {
        return this._name;
    }

    /**
     * Database name. Used in MySql and Sql Server.
     *
     * @returns {string}
     */
    get database() {
        return this._database;
    }

    /**
     * Schema name. Used in Postgres and Sql Server.
     *
     * @returns {string}
     */
    get schema() {
        return this._schema;
    }

    /**
     * Table type.
     *
     * @returns {string}
     */
    get type() {
        return this._type;
    }
}
