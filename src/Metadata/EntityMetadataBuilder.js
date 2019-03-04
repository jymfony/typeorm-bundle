const EntityMetadata = Jymfony.Bundle.TypeORMBundle.Metadata.EntityMetadata;
const RelationMetadata = Jymfony.Bundle.TypeORMBundle.Metadata.RelationMetadata;
const MetadataUtils = Jymfony.Bundle.TypeORMBundle.Utils.MetadataUtils;
const Base = require('typeorm/metadata-builder/EntityMetadataBuilder').EntityMetadataBuilder;

const { MysqlDriver } = require('typeorm/driver/mysql/MysqlDriver');
const { PostgresDriver } = require('typeorm/driver/postgres/PostgresDriver');
const { CheckMetadata } = require('typeorm/metadata/CheckMetadata');
const { ColumnMetadata } = require('typeorm/metadata/ColumnMetadata');
const { EntityListenerMetadata } = require('typeorm/metadata/EntityListenerMetadata');
const { ExclusionMetadata } = require('typeorm/metadata/ExclusionMetadata');
const { IndexMetadata } = require('typeorm/metadata/IndexMetadata');
const { RelationCountMetadata } = require('typeorm/metadata/RelationCountMetadata');
const { RelationIdMetadata } = require('typeorm/metadata/RelationIdMetadata');
const { UniqueMetadata } = require('typeorm/metadata/UniqueMetadata');

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
        // We take all "inheritance tree" from a target entity to collect all stored metadata args
        // (by decorators or inside entity schemas). For example for target Post < ContentModel < Unit
        // It will be an array of [Post, ContentModel, Unit] and we can then get all metadata args of those classes
        const inheritanceTree = MetadataUtils.getInheritanceTree(tableArgs.target);

        const tableInheritance = this._metadataArgsStorage.findInheritanceType(tableArgs.target);
        const tableTree = this._metadataArgsStorage.findTree(tableArgs.target);

        // If single table inheritance used, we need to copy all children columns in to parent table
        let singleTableChildrenTargets;
        if ((tableInheritance && 'STI' === tableInheritance.pattern) || 'entity-child' === tableArgs.type) {
            singleTableChildrenTargets = this._metadataArgsStorage
                .filterSingleTableChildren(tableArgs.target)
                .map(args => {
                    return args.target;
                })
                .filter(target => {
                    return isFunction(target);
                });

            inheritanceTree.push(...singleTableChildrenTargets);
        }

        return new EntityMetadata({
            connection: this._connection,
            args: tableArgs,
            inheritanceTree: inheritanceTree,
            tableTree: tableTree,
            inheritancePattern: tableInheritance ? tableInheritance.pattern : undefined,
        });
    }

    /**
     * @inheritdoc
     */
    computeEntityMetadataStep1(allEntityMetadatas, entityMetadata) {
        const entityInheritance = this._metadataArgsStorage.findInheritanceType(entityMetadata.target);

        const discriminatorValue = this._metadataArgsStorage.findDiscriminatorValue(entityMetadata.target);
        entityMetadata.discriminatorValue = discriminatorValue ? discriminatorValue.value : entityMetadata.target.name; // Todo: pass this to naming strategy to generate a name

        // If single table inheritance is used, we need to mark all embedded columns as nullable
        entityMetadata.embeddeds = this.createEmbeddedsRecursively(entityMetadata, this._metadataArgsStorage.filterEmbeddeds(entityMetadata.inheritanceTree))
            .map((embedded) => {
                if ('STI' === entityMetadata.inheritancePattern) {
                    embedded.columns = embedded.columns.map((column) => {
                        column.isNullable = true;
                        return column;
                    });
                }

                return embedded;
            });

        entityMetadata.ownColumns = this._metadataArgsStorage
            .filterColumns(entityMetadata.inheritanceTree)
            .map(args => {
                // For single table children we reuse columns created for their parents
                if ('entity-child' === entityMetadata.tableType) {
                    return entityMetadata.parentEntityMetadata.ownColumns.find(column => column.propertyName === args.propertyName);
                }

                const column = new ColumnMetadata({ connection: this._connection, entityMetadata, args });

                // If single table inheritance used, we need to mark all inherit table columns as nullable
                const columnInSingleTableInheritedChild = allEntityMetadatas.find(otherEntityMetadata => 'entity-child' === otherEntityMetadata.tableType && otherEntityMetadata.target === args.target);
                if (columnInSingleTableInheritedChild) {
                    column.isNullable = true;
                }

                return column;
            });

        // For table inheritance we need to add a discriminator column
        if (entityInheritance && entityInheritance.column) {
            const discriminatorColumnName = entityInheritance.column && entityInheritance.column.name ? entityInheritance.column.name : 'type';
            let discriminatorColumn = entityMetadata.ownColumns.find(column => column.propertyName === discriminatorColumnName);
            if (!discriminatorColumn) {
                discriminatorColumn = new ColumnMetadata({
                    connection: this._connection,
                    entityMetadata: entityMetadata,
                    args: {
                        target: entityMetadata.target,
                        mode: 'virtual',
                        propertyName: discriminatorColumnName,
                        options: entityInheritance.column || {
                            name: discriminatorColumnName,
                            type: 'varchar',
                            nullable: false,
                        },
                    },
                });
                discriminatorColumn.isVirtual = true;
                discriminatorColumn.isDiscriminator = true;
                entityMetadata.ownColumns.push(discriminatorColumn);
            } else {
                discriminatorColumn.isDiscriminator = true;
            }
        }

        // Add discriminator column to the child entity metadatas
        // Discriminator column will not be there automatically since we are creating it in the code above
        if ('entity-child' === entityMetadata.tableType) {
            const discriminatorColumn = entityMetadata.parentEntityMetadata.ownColumns.find(column => column.isDiscriminator);
            if (discriminatorColumn && !entityMetadata.ownColumns.find(column => column === discriminatorColumn)) {
                entityMetadata.ownColumns.push(discriminatorColumn);
            }
        }

        // Check if tree is used then we need to add extra columns for specific tree types
        if ('materialized-path' === entityMetadata.treeType) {
            entityMetadata.ownColumns.push(new ColumnMetadata({
                connection: this._connection,
                entityMetadata: entityMetadata,
                materializedPath: true,
                args: {
                    target: entityMetadata.target,
                    mode: 'virtual',
                    propertyName: 'mpath',
                    options: /* tree.column || */ {
                        name: 'mpath',
                        type: 'varchar',
                        nullable: true,
                        default: '',
                    },
                },
            }));
        } else if ('nested-set' === entityMetadata.treeType) {
            entityMetadata.ownColumns.push(new ColumnMetadata({
                connection: this._connection,
                entityMetadata: entityMetadata,
                nestedSetLeft: true,
                args: {
                    target: entityMetadata.target,
                    mode: 'virtual',
                    propertyName: 'nsleft',
                    options: /* tree.column || */ {
                        name: 'nsleft',
                        type: 'integer',
                        nullable: false,
                        default: 1,
                    },
                },
            }));
            entityMetadata.ownColumns.push(new ColumnMetadata({
                connection: this._connection,
                entityMetadata: entityMetadata,
                nestedSetRight: true,
                args: {
                    target: entityMetadata.target,
                    mode: 'virtual',
                    propertyName: 'nsright',
                    options: /* tree.column || */ {
                        name: 'nsright',
                        type: 'integer',
                        nullable: false,
                        default: 2,
                    },
                },
            }));
        }

        entityMetadata.ownRelations = this._metadataArgsStorage.filterRelations(entityMetadata.inheritanceTree).map(function (args) {
            // For single table children we reuse relations created for their parents
            if ('entity-child' === entityMetadata.tableType) {
                return entityMetadata.parentEntityMetadata.ownRelations.find(function (relation) {
                    return relation.propertyName === args.propertyName;
                });
            }

            return new RelationMetadata({ entityMetadata: entityMetadata, args: args });
        });

        entityMetadata.relationIds = this._metadataArgsStorage.filterRelationIds(entityMetadata.inheritanceTree).map(args => {
            // For single table children we reuse relation ids created for their parents
            if ('entity-child' === entityMetadata.tableType) {
                return entityMetadata.parentEntityMetadata.relationIds.find(relationId => relationId.propertyName === args.propertyName);
            }

            return new RelationIdMetadata({ entityMetadata, args });
        });

        entityMetadata.relationCounts = this._metadataArgsStorage.filterRelationCounts(entityMetadata.inheritanceTree).map(args => {
            // For single table children we reuse relation counts created for their parents
            if ('entity-child' === entityMetadata.tableType) {
                return entityMetadata.parentEntityMetadata.relationCounts.find(relationCount => relationCount.propertyName === args.propertyName);
            }

            return new RelationCountMetadata({ entityMetadata, args });
        });

        entityMetadata.ownIndices = this._metadataArgsStorage.filterIndices(entityMetadata.inheritanceTree).map(args => {
            return new IndexMetadata({ entityMetadata, args });
        });

        entityMetadata.ownListeners = this._metadataArgsStorage.filterListeners(entityMetadata.inheritanceTree).map(args => {
            return new EntityListenerMetadata({ entityMetadata: entityMetadata, args: args });
        });

        entityMetadata.checks = this._metadataArgsStorage.filterChecks(entityMetadata.inheritanceTree).map(args => {
            return new CheckMetadata({ entityMetadata, args });
        });

        // Only PostgreSQL supports exclusion constraints.
        if (this._connection.driver instanceof PostgresDriver) {
            entityMetadata.exclusions = this._metadataArgsStorage.filterExclusions(entityMetadata.inheritanceTree).map(args => {
                return new ExclusionMetadata({ entityMetadata, args });
            });
        }

        // Mysql stores unique constraints as unique indices.
        if (this._connection.driver instanceof MysqlDriver) {
            const indices = this._metadataArgsStorage.filterUniques(entityMetadata.inheritanceTree).map(args => {
                return new IndexMetadata({
                    entityMetadata: entityMetadata,
                    args: {
                        target: args.target,
                        name: args.name,
                        columns: args.columns,
                        unique: true,
                        synchronize: true,
                    },
                });
            });
            entityMetadata.ownIndices.push(...indices);
        } else {
            entityMetadata.uniques = this._metadataArgsStorage.filterUniques(entityMetadata.inheritanceTree).map(args => {
                return new UniqueMetadata({ entityMetadata, args });
            });
        }
    }
}

module.exports = EntityMetadataBuilder;
