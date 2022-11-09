import { EntityMetadataBuilder as Base } from 'typeorm/metadata-builder/EntityMetadataBuilder';
import { CheckMetadata } from 'typeorm/metadata/CheckMetadata';
import { DriverUtils } from 'typeorm/driver/DriverUtils';
import { EntityListenerMetadata } from 'typeorm/metadata/EntityListenerMetadata';
import { ExclusionMetadata } from 'typeorm/metadata/ExclusionMetadata';
import { IndexMetadata } from 'typeorm/metadata/IndexMetadata';
import { RelationCountMetadata } from 'typeorm/metadata/RelationCountMetadata';
import { RelationIdMetadata } from 'typeorm/metadata/RelationIdMetadata';
import { TypeORMError } from 'typeorm';
import { UniqueMetadata } from 'typeorm/metadata/UniqueMetadata';

const ColumnMetadata = Jymfony.Bundle.TypeORMBundle.Metadata.ColumnMetadata;
const RelationMetadata = Jymfony.Bundle.TypeORMBundle.Metadata.RelationMetadata;

/**
 * @memberOf Jymfony.Bundle.TypeORMBundle.Metadata
 */
export default class EntityMetadataBuilder extends Base {
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
     * Computes entity metadata's relations inverse side properties.
     */
    computeInverseProperties(entityMetadata, entityMetadatas) {
        entityMetadata.relations.forEach(relation => {
            // Compute inverse side (related) entity metadatas for all relation metadatas
            const inverseEntityMetadata = entityMetadatas.find((m) => {
                if (m.target === relation.type) {
                    return true;
                }

                if (isString(relation.type)) {
                    return m.targetName === relation.type || m.givenTableName === relation.type;
                }

                return false;
            });

            if (!inverseEntityMetadata) {
                throw new TypeORMError(__jymfony.sprintf('Entity metadata for %s#%s was not found. Check if you specified a correct entity object and if it\'s connected in the connection options.', entityMetadata.name, relation.propertyPath));
            }

            relation.inverseEntityMetadata = inverseEntityMetadata;
            relation.inverseSidePropertyPath = relation.buildInverseSidePropertyPath();
            relation.inverseRelation = inverseEntityMetadata.relations.find(foundRelation => foundRelation.propertyPath === relation.inverseSidePropertyPath);
        });
    }
    /**
     * @inheritdoc
     */
    computeEntityMetadataStep1(allEntityMetadatas, entityMetadata) {
        const entityInheritance = this._metadataArgsStorage.findInheritanceType(entityMetadata.target);
        const discriminatorValue = this._metadataArgsStorage.findDiscriminatorValue(entityMetadata.target);
        if ('undefined' !== typeof discriminatorValue) {
            entityMetadata.discriminatorValue = discriminatorValue.value;
        } else {
            entityMetadata.discriminatorValue = entityMetadata.target.name;
        }

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
            .map((args) => {
                // For single table children we reuse columns created for their parents
                if ('entity-child' === entityMetadata.tableType) {
                    return entityMetadata.parentEntityMetadata.ownColumns.find((column) => column.propertyName === args.propertyName);
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

        const { namingStrategy } = this._connection;

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
                        name: namingStrategy.materializedPathColumnName,
                        type: String,
                        nullable: true,
                        default: '',
                    },
                },
            }));
        } else if ('nested-set' === entityMetadata.treeType) {
            const { left, right } = namingStrategy.nestedSetColumnNames;
            entityMetadata.ownColumns.push(new ColumnMetadata({
                connection: this._connection,
                entityMetadata: entityMetadata,
                nestedSetLeft: true,
                args: {
                    target: entityMetadata.target,
                    mode: 'virtual',
                    propertyName: left,
                    options: /* tree.column || */ {
                        name: left,
                        type: Number,
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
                    propertyName: right,
                    options: /* tree.column || */ {
                        name: right,
                        type: Number,
                        nullable: false,
                        default: 2,
                    },
                },
            }));
        }

        entityMetadata.ownRelations = this._metadataArgsStorage
            .filterRelations(entityMetadata.inheritanceTree)
            .map((args) => {
                // For single table children we reuse relations created for their parents
                if ('entity-child' === entityMetadata.tableType) {
                    const parentRelation = entityMetadata.parentEntityMetadata.ownRelations.find(relation => relation.propertyName === args.propertyName);
                    const type = isFunction(args.type) && !ReflectionClass.exists(args.type) ? args.type() : args.type;

                    if (parentRelation.type !== type) {
                        const clone = Object.create(parentRelation);
                        clone.type = type;
                        return clone;
                    }

                    return parentRelation;
                }

                return new RelationMetadata({ entityMetadata, args });
            });

        entityMetadata.relationIds = this._metadataArgsStorage
            .filterRelationIds(entityMetadata.inheritanceTree)
            .map(args => {
                // For single table children we reuse relation ids created for their parents
                if ('entity-child' === entityMetadata.tableType) {
                    return entityMetadata.parentEntityMetadata.relationIds.find((relationId) => relationId.propertyName === args.propertyName);
                }
                return new RelationIdMetadata({ entityMetadata, args });
            });

        entityMetadata.relationCounts = this._metadataArgsStorage
            .filterRelationCounts(entityMetadata.inheritanceTree)
            .map(args => {
                // For single table children we reuse relation counts created for their parents
                if ('entity-child' === entityMetadata.tableType) {
                    return entityMetadata.parentEntityMetadata.relationCounts.find((relationCount) => relationCount.propertyName === args.propertyName);
                }
                return new RelationCountMetadata({ entityMetadata, args });
            });

        entityMetadata.ownListeners = this._metadataArgsStorage
            .filterListeners(entityMetadata.inheritanceTree)
            .map((args) => {
                return new EntityListenerMetadata({
                    entityMetadata: entityMetadata,
                    args: args,
                });
            });

        entityMetadata.checks = this._metadataArgsStorage
            .filterChecks(entityMetadata.inheritanceTree)
            .map((args) => new CheckMetadata({ entityMetadata, args }));

        // Only PostgreSQL supports exclusion constraints.
        if ('postgres' === this._connection.driver.options.type) {
            entityMetadata.exclusions = this._metadataArgsStorage
                .filterExclusions(entityMetadata.inheritanceTree)
                .map(args => new ExclusionMetadata({ entityMetadata, args }));
        }

        if ('cockroachdb' === this._connection.driver.options.type) {
            entityMetadata.ownIndices = this._metadataArgsStorage
                .filterIndices(entityMetadata.inheritanceTree)
                .filter(args => !args.unique)
                .map(args => new IndexMetadata({ entityMetadata, args }));

            const uniques = this._metadataArgsStorage
                .filterIndices(entityMetadata.inheritanceTree)
                .filter((args) => args.unique)
                .map(args => new UniqueMetadata({
                    entityMetadata: entityMetadata,
                    args: {
                        target: args.target,
                        name: args.name,
                        columns: args.columns,
                    },
                }));
            entityMetadata.ownUniques.push(...uniques);
        } else {
            entityMetadata.ownIndices = this._metadataArgsStorage
                .filterIndices(entityMetadata.inheritanceTree)
                .map(args => new IndexMetadata({ entityMetadata, args }));
        }

        // This drivers stores unique constraints as unique indices.
        if (DriverUtils.isMySQLFamily(this._connection.driver) ||
            'aurora-mysql' === this._connection.driver.options.type ||
            'sap' === this._connection.driver.options.type ||
            'spanner' === this._connection.driver.options.type) {
            const indices = this._metadataArgsStorage
                .filterUniques(entityMetadata.inheritanceTree)
                .map(args => new IndexMetadata({
                    entityMetadata: entityMetadata,
                    args: {
                        target: args.target,
                        name: args.name,
                        columns: args.columns,
                        unique: true,
                        synchronize: true,
                    },
                }));
            entityMetadata.ownIndices.push(...indices);
        } else {
            const uniques = this._metadataArgsStorage
                .filterUniques(entityMetadata.inheritanceTree)
                .map(args => new UniqueMetadata({ entityMetadata, args }));
            entityMetadata.ownUniques.push(...uniques);
        }
    }
}
