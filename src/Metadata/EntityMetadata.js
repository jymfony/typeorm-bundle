import { EntityMetadata as Base } from 'typeorm';

/**
 * @memberOf Jymfony.Bundle.TypeORMBundle.Metadata
 */
export default class EntityMetadata extends Base {
    engine;
    database;
    givenTableName;
    targetName;
    tableNameWithoutPrefix;
    tableName;
    tablePath;
    name;
    orderBy;
    discriminatorValue;
    treeParentRelation;
    treeChildrenRelation;
    createDateColumn;
    updateDateColumn;
    deleteDateColumn;
    versionColumn;
    discriminatorColumn;
    treeLevelColumn;
    nestedSetLeftColumn;
    nestedSetRightColumn;
    materializedPathColumn;
    objectIdColumn;
    propertiesMap;

    create(queryRunner = undefined) {
        let ret;
        if (isFunction(this.target)) {
            // If target is set to a function (e.g. class) that can be created then create it
            ret = ReflectionClass.exists(this.target)
                ? new ReflectionClass(this.target).newInstanceWithoutConstructor()
                : new this.target();
        } else {
            // Otherwise simply return a new empty object
            ret = {};
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
