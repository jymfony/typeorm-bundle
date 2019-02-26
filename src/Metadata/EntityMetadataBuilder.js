const EntityMetadata = Jymfony.Bundle.TypeORMBundle.Metadata.EntityMetadata;
const RelationMetadata = Jymfony.Bundle.TypeORMBundle.Metadata.RelationMetadata;
const Base = require('typeorm/metadata-builder/EntityMetadataBuilder').EntityMetadataBuilder;
const { MetadataUtils } = require('typeorm/metadata-builder/MetadataUtils');

/**
 * @memberOf Jymfony.Bundle.TypeORMBundle.Metadata
 */
class EntityMetadataBuilder extends Base {
    constructor(connection, metadataArgsStorage) {
        super(connection, metadataArgsStorage);

        /**
         * @type {Connection}
         *
         * @private
         */
        this._connection = connection;

        /**
         * @type {MetadataArgsStorage}
         *
         * @private
         */
        this._metadataArgsStorage = metadataArgsStorage;
    }

    /**
     * @inheritdoc
     */
    createEntityMetadata(tableArgs) {
        // we take all "inheritance tree" from a target entity to collect all stored metadata args
        // (by decorators or inside entity schemas). For example for target Post < ContentModel < Unit
        // it will be an array of [Post, ContentModel, Unit] and we can then get all metadata args of those classes
        const inheritanceTree = tableArgs.target instanceof Function
            ? MetadataUtils.getInheritanceTree(tableArgs.target)
            : [tableArgs.target]; // todo: implement later here inheritance for string-targets

        const tableInheritance = this._metadataArgsStorage.findInheritanceType(tableArgs.target);
        const tableTree = this._metadataArgsStorage.findTree(tableArgs.target);

        // if single table inheritance used, we need to copy all children columns in to parent table
        let singleTableChildrenTargets;
        if ((tableInheritance && tableInheritance.pattern === "STI") || tableArgs.type === "entity-child") {
            singleTableChildrenTargets = this._metadataArgsStorage
                .filterSingleTableChildren(tableArgs.target)
                .map(function (args) { return args.target; })
                .filter(function (target) { return target instanceof Function; });

            inheritanceTree.push(...singleTableChildrenTargets);
        }

        return new EntityMetadata({
            connection: this._connection,
            args: tableArgs,
            inheritanceTree: inheritanceTree,
            tableTree: tableTree,
            inheritancePattern: tableInheritance ? tableInheritance.pattern : undefined
        });
    }

    /**
     * @inheritdoc
     */
    computeEntityMetadataStep1(allEntityMetadatas, entityMetadata) {
        super.computeEntityMetadataStep1(allEntityMetadatas, entityMetadata);

        entityMetadata.ownRelations = this._metadataArgsStorage.filterRelations(entityMetadata.inheritanceTree).map(function (args) {
            // for single table children we reuse relations created for their parents
            if (entityMetadata.tableType === "entity-child")
                return entityMetadata.parentEntityMetadata.ownRelations.find(function (relation) { return relation.propertyName === args.propertyName; });

            return new RelationMetadata({ entityMetadata: entityMetadata, args: args });
        });
    }
}

module.exports = EntityMetadataBuilder;
