const ColumnMetadata = Jymfony.Bundle.TypeORMBundle.Metadata.ColumnMetadata;
const EmbeddedMetadata = Jymfony.Bundle.TypeORMBundle.Metadata.EmbeddedMetadata;
const EntityMetadata = Jymfony.Bundle.TypeORMBundle.Metadata.EntityMetadata;
const RelationMetadata = Jymfony.Bundle.TypeORMBundle.Metadata.RelationMetadata;
const MetadataUtils = Jymfony.Bundle.TypeORMBundle.Utils.MetadataUtils;
const Base = require('typeorm/metadata-builder/EntityMetadataBuilder').EntityMetadataBuilder;

const { MysqlDriver } = require('typeorm/driver/mysql/MysqlDriver');
const { PostgresDriver } = require('typeorm/driver/postgres/PostgresDriver');
const { SqlServerDriver } = require('typeorm/driver/sqlserver/SqlServerDriver');
const { CheckMetadata } = require('typeorm/metadata/CheckMetadata');
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
    build(entityClasses) {
        // if entity classes to filter entities by are given then do filtering, otherwise use all
        const allTables = entityClasses ? this._metadataArgsStorage.filterTables(entityClasses) : this._metadataArgsStorage.tables;

        // filter out table metadata args for those we really create entity metadatas and tables in the db
        const realTables = allTables.filter(table => table.type === "regular" || table.type === "closure" || table.type === "entity-child");

        // create entity metadatas for a user defined entities (marked with @Entity decorator or loaded from entity schemas)
        const entityMetadatas = realTables.map(tableArgs => this.createEntityMetadata(tableArgs));

        // compute parent entity metadatas for table inheritance
        entityMetadatas.forEach(entityMetadata => this.computeParentEntityMetadata(entityMetadatas, entityMetadata));

        // after all metadatas created we set child entity metadatas for table inheritance
        entityMetadatas.forEach(metadata => {
            metadata.childEntityMetadatas = entityMetadatas.filter(childMetadata => {
                return metadata.target instanceof Function
                    && childMetadata.target instanceof Function
                    && MetadataUtils.isInherited(childMetadata.target, metadata.target);
            });
        });

        // build entity metadata (step0), first for non-single-table-inherited entity metadatas (dependant)
        entityMetadatas
            .filter(entityMetadata => entityMetadata.tableType !== "entity-child")
            .forEach(entityMetadata => entityMetadata.build());

        // build entity metadata (step0), now for single-table-inherited entity metadatas (dependant)
        entityMetadatas
            .filter(entityMetadata => entityMetadata.tableType === "entity-child")
            .forEach(entityMetadata => entityMetadata.build());

        // compute entity metadata columns, relations, etc. first for the regular, non-single-table-inherited entity metadatas
        entityMetadatas
            .filter(entityMetadata => entityMetadata.tableType !== "entity-child")
            .forEach(entityMetadata => this.computeEntityMetadataStep1(entityMetadatas, entityMetadata));

        // then do it for single table inheritance children (since they are depend on their parents to be built)
        entityMetadatas
            .filter(entityMetadata => entityMetadata.tableType === "entity-child")
            .forEach(entityMetadata => this.computeEntityMetadataStep1(entityMetadatas, entityMetadata));

        // calculate entity metadata computed properties and all its sub-metadatas
        entityMetadatas.forEach(entityMetadata => this.computeEntityMetadataStep2(entityMetadata));

        // calculate entity metadata's inverse properties
        entityMetadatas.forEach(entityMetadata => this.computeInverseProperties(entityMetadata, entityMetadatas));

        // go through all entity metadatas and create foreign keys / junction entity metadatas for their relations
        entityMetadatas
            .filter(entityMetadata => entityMetadata.tableType !== "entity-child")
            .forEach(entityMetadata => {
                // create entity's relations join columns (for many-to-one and one-to-one owner)
                entityMetadata.relations.filter(relation => relation.isOneToOne || relation.isManyToOne).forEach(relation => {
                    const joinColumns = this._metadataArgsStorage.filterJoinColumns(relation.target, relation.propertyName);
                    const { foreignKey, uniqueConstraint } = this.relationJoinColumnBuilder.build(joinColumns, relation); // create a foreign key based on its metadata args
                    if (foreignKey) {
                        relation.registerForeignKeys(foreignKey); // push it to the relation and thus register there a join column
                        entityMetadata.foreignKeys.push(foreignKey);
                    }
                    if (uniqueConstraint) {
                        if (this._connection.driver instanceof MysqlDriver || this._connection.driver instanceof SqlServerDriver) {
                            const index = new IndexMetadata({
                                entityMetadata: uniqueConstraint.entityMetadata,
                                columns: uniqueConstraint.columns,
                                args: {
                                    target: uniqueConstraint.target,
                                name: uniqueConstraint.name,
                                unique: true,
                                synchronize: true
                        }
                        });

                            if (this._connection.driver instanceof SqlServerDriver) {
                                index.where = index.columns.map(column => {
                                    return `${this._connection.driver.escape(column.databaseName)} IS NOT NULL`;
                                }).join(" AND ");
                            }

                            if (relation.embeddedMetadata) {
                                relation.embeddedMetadata.indices.push(index);
                            } else {
                                relation.entityMetadata.ownIndices.push(index);
                            }
                            this.computeEntityMetadataStep2(entityMetadata);

                        } else {
                            // todo: fix missing uniques in embedded metadata
                            // if (relation.embeddedMetadata) {
                            //     relation.embeddedMetadata.uniques.push(index);
                            // } else {
                            relation.entityMetadata.uniques.push(uniqueConstraint); // todo: ownUniques is missing
                            // }
                            this.computeEntityMetadataStep2(entityMetadata);
                        }
                    }
                });

                // create junction entity metadatas for entity many-to-many relations
                entityMetadata.relations.filter(relation => relation.isManyToMany).forEach(relation => {
                    const joinTable = this._metadataArgsStorage.findJoinTable(relation.target, relation.propertyName);
                    if (! joinTable) {
                        // no join table set - no need to do anything (it means this is many-to-many inverse side)
                        return;
                    }

                    // here we create a junction entity metadata for a new junction table of many-to-many relation
                    const junctionEntityMetadata = this.junctionEntityMetadataBuilder.build(relation, joinTable);
                    relation.registerForeignKeys(...junctionEntityMetadata.foreignKeys);
                    relation.registerJunctionEntityMetadata(junctionEntityMetadata);

                    // compute new entity metadata properties and push it to entity metadatas pool
                    this.computeEntityMetadataStep2(junctionEntityMetadata);
                    this.computeInverseProperties(junctionEntityMetadata, entityMetadatas);
                    entityMetadatas.push(junctionEntityMetadata);
                });
            });

        // update entity metadata depend properties
        entityMetadatas
            .forEach(entityMetadata => {
                entityMetadata.relationsWithJoinColumns = entityMetadata.relations.filter(relation => relation.isWithJoinColumn);
                entityMetadata.hasNonNullableRelations = entityMetadata.relationsWithJoinColumns.some(relation => !relation.isNullable || relation.isPrimary);
            });

        // generate closure junction tables for all closure tables
        entityMetadatas
            .filter(metadata => metadata.treeType === "closure-table")
            .forEach(entityMetadata => {
                const closureJunctionEntityMetadata = this.closureJunctionEntityMetadataBuilder.build(entityMetadata);
                entityMetadata.closureJunctionTable = closureJunctionEntityMetadata;
                this.computeEntityMetadataStep2(closureJunctionEntityMetadata);
                this.computeInverseProperties(closureJunctionEntityMetadata, entityMetadatas);
                entityMetadatas.push(closureJunctionEntityMetadata);
            });

        // generate keys for tables with single-table inheritance
        entityMetadatas
            .filter(metadata => metadata.inheritancePattern === "STI" && metadata.discriminatorColumn)
            .forEach(entityMetadata => this.createKeysForTableInheritance(entityMetadata));

        // build all indices (need to do it after relations and their join columns are built)
        entityMetadatas.forEach(entityMetadata => {
            entityMetadata.indices.forEach(index => index.build(this._connection.namingStrategy));
        });

        // build all unique constraints (need to do it after relations and their join columns are built)
        entityMetadatas.forEach(entityMetadata => {
            entityMetadata.uniques.forEach(unique => unique.build(this._connection.namingStrategy));
        });

        // build all check constraints
        entityMetadatas.forEach(entityMetadata => {
            entityMetadata.checks.forEach(check => check.build(this._connection.namingStrategy));
        });

        // build all exclusion constraints
        entityMetadatas.forEach(entityMetadata => {
            entityMetadata.exclusions.forEach(exclusion => exclusion.build(this._connection.namingStrategy));
        });

        // add lazy initializer for entity relations
        entityMetadatas
            .filter(metadata => metadata.target instanceof Function)
            .forEach(entityMetadata => {
                entityMetadata.relations
                    .filter(relation => relation.isLazy)
                    .forEach(relation => {
                        if (relation.embeddedMetadata) {
                            return;
                        }

                        this._connection.relationLoader.enableLazyLoad(relation, entityMetadata.target.prototype);
                    });
            });

        entityMetadatas.forEach(entityMetadata => {
            entityMetadata.columns.forEach(column => {
                // const target = column.embeddedMetadata ? column.embeddedMetadata.type : column.target;
                const generated = this._metadataArgsStorage.findGenerated(column.target, column.propertyName);
                if (generated) {
                    column.isGenerated = true;
                    column.generationStrategy = generated.strategy;
                    if (generated.strategy === "uuid") {
                        column.type = "uuid";
                    } else if (generated.strategy === "rowid") {
                        column.type = "int";
                    } else {
                        column.type = column.type || Number;
                    }

                    column.build(this._connection);
                    this.computeEntityMetadataStep2(entityMetadata);
                }
            });

        });

        for (const metadata of entityMetadatas) {
            this.computeInverseProperties(metadata, entityMetadatas);
        }

        return entityMetadatas;
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

    /**
     * Creates from the given embedded metadata args real embedded metadatas with its columns and relations,
     * and does the same for all its sub-embeddeds (goes recursively).
     */
    createEmbeddedsRecursively(entityMetadata, embeddedArgs) {
        return embeddedArgs.map(embeddedArgs => {
            const embeddedMetadata = new EmbeddedMetadata({ entityMetadata: entityMetadata, args: embeddedArgs });
            const targets = MetadataUtils.getInheritanceTree(embeddedMetadata.type);

            embeddedMetadata.columns = this._metadataArgsStorage.filterColumns(targets).map(args => {
                return new ColumnMetadata({ connection: this._connection, entityMetadata, embeddedMetadata, args});
            });
            embeddedMetadata.relations = this._metadataArgsStorage.filterRelations(targets).map(args => {
                return new RelationMetadata({ entityMetadata, embeddedMetadata, args });
            });
            embeddedMetadata.listeners = this._metadataArgsStorage.filterListeners(targets).map(args => {
                return new EntityListenerMetadata({ entityMetadata, embeddedMetadata, args });
            });
            embeddedMetadata.indices = this._metadataArgsStorage.filterIndices(targets).map(args => {
                return new IndexMetadata({ entityMetadata, embeddedMetadata, args });
            });
            embeddedMetadata.relationIds = this._metadataArgsStorage.filterRelationIds(targets).map(args => {
                return new RelationIdMetadata({ entityMetadata, args });
            });
            embeddedMetadata.relationCounts = this._metadataArgsStorage.filterRelationCounts(targets).map(args => {
                return new RelationCountMetadata({ entityMetadata, args });
            });

            embeddedMetadata.embeddeds = this.createEmbeddedsRecursively(entityMetadata, this._metadataArgsStorage.filterEmbeddeds(targets));
            embeddedMetadata.embeddeds.forEach(subEmbedded => subEmbedded.parentEmbeddedMetadata = embeddedMetadata);

            entityMetadata.allEmbeddeds.push(embeddedMetadata);

            return embeddedMetadata;
        });
    }
}

module.exports = EntityMetadataBuilder;
