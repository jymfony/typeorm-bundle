import { EmbeddedMetadata as Base } from 'typeorm/metadata/EmbeddedMetadata';

/**
 * @memberOf Jymfony.Bundle.TypeORMBundle.Metadata
 */
export default class EmbeddedMetadata extends Base {
    /**
     * Constructor.
     *
     * @param options
     */
    constructor(options) {
        super(options);

        /**
         * @type {Connection}
         *
         * @private
         */
        this._connection = undefined;
    }

    /**
     * Build metadata.
     *
     * @param {Connection} connection
     *
     * @returns {EmbeddedMetadata}
     */
    build(connection) {
        this._connection = connection;

        return super.build(connection);
    }

    /**
     * Creates a new embedded object.
     */
    create(entity = undefined) {
        const instance = ReflectionClass.exists(this.type)
            ? new ReflectionClass(this.type).newInstanceWithoutConstructor()
            : new this.type();

        this.relations
            .filter(relation => relation.isLazy)
            .forEach(relation => this._connection.relationLoader.enableEmbeddableLazyLoad(relation, instance, entity))
        ;

        return instance;
    }
}
