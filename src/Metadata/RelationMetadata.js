import { RelationMetadata as Base } from 'typeorm/metadata/RelationMetadata';

/**
 * @memberOf Jymfony.Bundle.TypeORMBundle.Metadata
 */
export default class RelationMetadata extends Base {
    propertyPath;
    inverseEntityMetadata;
    inverseSidePropertyPath;
    inverseRelation;

    constructor(options) {
        let type = options.args.type;
        if (isFunction(type)) {
            type = ! ReflectionClass.exists(type) ? type() : type;

            try {
                const reflClass = new ReflectionClass(type);
                type = () => reflClass.getConstructor();
            } catch (e) {
                // Do nothing
            }
        }

        options.args.type = type;
        super(options);
    }

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

        } else if (ReflectionClass.exists(this.entityMetadata.target)) {
            const inverseSideProperty = this.inverseEntityMetadata.relations
                .find(r => r.inverseEntityMetadata && r.inverseEntityMetadata.target === this.target);

            if (inverseSideProperty) {
                return inverseSideProperty.propertyName;
            }
        } else if (this.isTreeParent && this.entityMetadata.treeChildrenRelation) {
            return this.entityMetadata.treeChildrenRelation.propertyName;
        } else if (this.isTreeChildren && this.entityMetadata.treeParentRelation) {
            return this.entityMetadata.treeParentRelation.propertyName;
        }

        return '';
    }
}
