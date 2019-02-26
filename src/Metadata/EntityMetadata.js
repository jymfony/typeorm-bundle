const Base = require('typeorm').EntityMetadata;

/**
 * @memberOf Jymfony.Bundle.TypeORMBundle.Metadata
 */
class EntityMetadata extends Base {
    create(queryRunner = undefined) {
        // if target is set to a function (e.g. class) that can be created then create it
        let ret;
        if (this.target instanceof Function) {
            ret = new ReflectionClass(this.target).newInstanceWithoutConstructor();
            this.lazyRelations.forEach(relation => this.connection.relationLoader.enableLazyLoad(relation, ret, queryRunner));

            return ret;
        }

        // otherwise simply return a new empty object
        const newObject = {};
        this.lazyRelations.forEach(relation => this.connection.relationLoader.enableLazyLoad(relation, newObject, queryRunner));

        return newObject;
    }
}

module.exports = EntityMetadata;
