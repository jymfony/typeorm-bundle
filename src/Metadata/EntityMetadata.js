const Base = require('typeorm').EntityMetadata;

/**
 * @memberOf Jymfony.Bundle.TypeORMBundle.Metadata
 */
class EntityMetadata extends Base {
    create(queryRunner = undefined) {
        let ret;
        if (isFunction(this.target)) {
            // If target is set to a function (e.g. class) that can be created then create it
            ret = ReflectionClass.exists(this.target)
                ? new ReflectionClass(this.target).newInstanceWithoutConstructor()
                : new this.target();
        } else {
            // Otherwise simply return a new empty object
            ret = {}
        }

        this.lazyRelations.forEach(relation => {
            if (relation.embeddedMetadata) {
                return;
            }

            this.connection.relationLoader.enableLazyLoad(relation, ret, queryRunner);
        });

        return ret;
    }
}

module.exports = EntityMetadata;
