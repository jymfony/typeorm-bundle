import { RelationLoader as Base } from 'typeorm/query-builder/RelationLoader';

/**
 * @memberOf Jymfony.Bundle.TypeORMBundle.QueryBuilder
 */
export default class RelationLoader extends Base {
    /**
     * Wraps given entity and creates getters/setters for its given relation
     * to be able to lazily load data when accessing this relation.
     *
     * @param {RelationMetadata} relation
     * @param {*} entity
     * @param {QueryRunner} [queryRunner]
     */
    enableLazyLoad(relation, entity, queryRunner = undefined) {
        this._createLazyProperty(relation, entity, entity, queryRunner);
    }

    /**
     * Wraps given embeddable entity and creates getters/setters for its given relation
     * to be able to lazily load data when accessing this relation.
     *
     * @param {RelationMetadata} relation
     * @param {*} embedded
     * @param {*} entity
     */
    enableEmbeddableLazyLoad(relation, embedded, entity) {
        this._createLazyProperty(relation, embedded, entity || embedded, undefined);
    }

    _createLazyProperty(relation, instance, entity, queryRunner) {
        const relationLoader = this;
        const dataIndex = Symbol('data: ' + relation.propertyName);
        const promiseIndex = Symbol('promise: ' + relation.propertyName);
        const resolveIndex = Symbol('has: ' + relation.propertyName);

        Object.defineProperty(instance, relation.propertyName, {
            get: function() {
                if (true === this[resolveIndex] || this[dataIndex]) {
                    // If related data already was loaded then simply return it
                    return Promise.resolve(this[dataIndex]);
                }

                if (this[promiseIndex]) {
                    // If related data is loading then return a promise relationLoader loads it
                    return this[promiseIndex];
                }

                // Nothing is loaded yet, load relation data and save it in the model once they are loaded
                this[promiseIndex] = relationLoader.load(relation, entity, queryRunner).then(result => {
                    if (relation.isOneToOne || relation.isManyToOne) {
                        result = result[0];
                    }

                    this[dataIndex] = result;
                    this[resolveIndex] = true;
                    delete this[promiseIndex];
                    return this[dataIndex];
                });

                return this[promiseIndex];
            },
            set: function(value) {
                if (isPromise(value)) {
                    // If set data is a promise then wait for its resolve and save in the object
                    value.then(result => {
                        this[dataIndex] = result;
                        this[resolveIndex] = true;
                    });
                } else {
                    // If its direct data set (non promise, probably not safe-typed)
                    this[dataIndex] = value;
                    this[resolveIndex] = true;
                }
            },
            configurable: true,
        });
    }
}
