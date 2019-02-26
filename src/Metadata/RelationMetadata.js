const Base = require('typeorm/metadata/RelationMetadata').RelationMetadata;

class RelationMetadata extends Base {
    /**
     * @inheritdoc
     */
    buildInverseSidePropertyPath() {
        if (this.givenInverseSidePropertyFactory) {
            const ownerEntityPropertiesMap = this.inverseEntityMetadata.propertiesMap;

            if (isFunction(this.givenInverseSidePropertyFactory)) {
                return this.givenInverseSidePropertyFactory(ownerEntityPropertiesMap);
            }

            if (isString(this.givenInverseSidePropertyFactory)) {
                return this.givenInverseSidePropertyFactory;
            }

            if (ReflectionClass.exists(this.entityMetadata.target)) {
                const inverseSideProperty = this.inverseEntityMetadata.relations
                    .find(r => r.inverseEntityMetadata.target === this.target);

                if (inverseSideProperty) {
                    return inverseSideProperty.propertyName;
                }
            }
        } else if (this.isTreeParent && this.entityMetadata.treeChildrenRelation) {
            return this.entityMetadata.treeChildrenRelation.propertyName;
        } else if (this.isTreeChildren && this.entityMetadata.treeParentRelation) {
            return this.entityMetadata.treeParentRelation.propertyName;
        }

        return "";
    }
}

module.exports = RelationMetadata;
