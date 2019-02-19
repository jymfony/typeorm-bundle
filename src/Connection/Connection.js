const typeorm = require('typeorm');
const Base = typeorm.Connection;
const { EntitySchema } = typeorm;

/**
 * @memberOf Jymfony.Bundle.TypeORMBundle.Connection
 */
class Connection extends Base {
    constructor(options) {
        super(options);
        this.buildMetadatas();
    }

    /**
     * @inheritdoc
     */
    findMetadata(target) {
        if (ReflectionClass.exists(target)) {
            target = (new ReflectionClass(target)).getConstructor();
        }

        return this.entityMetadatas.find(metadata => {
            if (metadata.target === target) {
                return true;
            }

            if (target instanceof EntitySchema) {
                return metadata.name === target.options.name;
            }

            if (isString(target)) {
                if (target.indexOf(".") !== -1) {
                    return metadata.tablePath === target;
                } else {
                    return metadata.name === target || metadata.tableName === target;
                }
            }

            return false;
        });
    }
}

module.exports = Connection;
