const Base = require('typeorm/entity-schema/EntitySchemaTransformer').EntitySchemaTransformer;
const { MetadataArgsStorage } = require('typeorm/metadata-args/MetadataArgsStorage');
const { AbstractRepository, Repository } = require('typeorm');

/**
 * @memberOf Jymfony.Bundle.TypeORMBundle.Metadata
 */
class EntitySchemaTransformer extends Base {
    /**
     * Transforms entity schema into new metadata args storage object.
     */
    transform(schemas) {
        const metadataArgsStorage = new MetadataArgsStorage();

        const embeddableClasses = schemas
            .filter(es => es.options.embeddable)
            .map(es => es.options.target)
        ;

        for (const entitySchema of schemas) {
            const options = entitySchema.options;

            if (! options.embeddable) {
                // Add table metadata args from the schema
                const tableMetadata = {
                    target: options.target || options.name,
                    name: options.tableName,
                    database: options.database,
                    schema: options.schema,
                    type: options.type || 'regular',
                    orderBy: options.orderBy,
                    synchronize: options.synchronize,
                };

                metadataArgsStorage.tables.push(tableMetadata);

                // Embeddable can't have a repository.
                this._processRepository(metadataArgsStorage, entitySchema);
            }

            this._processColumns(metadataArgsStorage, entitySchema, embeddableClasses);
            this._processRelations(metadataArgsStorage, entitySchema);
            this._processIndices(metadataArgsStorage, entitySchema);

            // Add check metadata args from the schema
            (options.checks || []).forEach(check => {
                const checkArgs = {
                    target: options.target || options.name,
                    name: check.name,
                    expression: check.expression,
                };
                metadataArgsStorage.checks.push(checkArgs);
            });

            // Add exclusion metadata args from the schema
            (options.exclusions || []).forEach(exclusion => {
                const exclusionArgs = {
                    target: options.target || options.name,
                    name: exclusion.name,
                    expression: exclusion.expression,
                };
                metadataArgsStorage.exclusions.push(exclusionArgs);
            });
        }

        return metadataArgsStorage;
    }

    /**
     * Process columns in schema.
     *
     * @param {MetadataArgsStorage} metadataArgsStorage
     * @param {EntitySchema} entitySchema
     * @param {Function[]} embeddableClasses
     *
     * @private
     */
    _processColumns(metadataArgsStorage, entitySchema, embeddableClasses) {
        const options = entitySchema.options;

        for (const [ columnName, column ] of __jymfony.getEntries(options.columns || {})) {
            const columnType = ReflectionClass.exists(column.type) && (new ReflectionClass(column.type)).getConstructor();
            const embedded = embeddableClasses.find(v => v === columnType);

            if (embedded) {
                metadataArgsStorage.embeddeds.push({
                    target: options.target || options.name,
                    propertyName: columnName,
                    isArray: true === column.array,
                    prefix: column.prefix,
                    type: () => columnType,
                });

                continue;
            }

            let mode = 'regular';
            if (column.createDate) {
                mode = 'createDate';
            }
            if (column.updateDate) {
                mode = 'updateDate';
            }
            if (column.version) {
                mode = 'version';
            }
            if (column.treeChildrenCount) {
                mode = 'treeChildrenCount';
            }
            if (column.treeLevel) {
                mode = 'treeLevel';
            }
            if (column.objectId) {
                mode = 'objectId';
            }

            const columnArgs = {
                target: options.target || options.name,
                mode: mode,
                propertyName: columnName,
                options: {
                    type: column.type,
                    name: column.objectId ? '_id' : column.name,
                    length: column.length,
                    width: column.width,
                    nullable: column.nullable,
                    readonly: column.readonly,
                    select: column.select,
                    primary: column.primary,
                    unique: column.unique,
                    comment: column.comment,
                    default: column.default,
                    onUpdate: column.onUpdate,
                    precision: column.precision,
                    scale: column.scale,
                    zerofill: column.zerofill,
                    unsigned: column.unsigned,
                    charset: column.charset,
                    collation: column.collation,
                    enum: column.enum,
                    asExpression: column.asExpression,
                    generatedType: column.generatedType,
                    hstoreType: column.hstoreType,
                    array: column.array,
                    transformer: column.transformer,
                },
            };

            metadataArgsStorage.columns.push(columnArgs);

            if (column.generated) {
                const generationArgs = {
                    target: options.target || options.name,
                    propertyName: columnName,
                    strategy: isString(column.generated) ? column.generated : 'increment',
                };

                metadataArgsStorage.generations.push(generationArgs);
            }
        }
    }

    /**
     * Process relations in schema.
     *
     * @param {MetadataArgsStorage} metadataArgsStorage
     * @param {EntitySchema} entitySchema
     *
     * @private
     */
    _processRelations(metadataArgsStorage, entitySchema) {
        const options = entitySchema.options;

        for (const [ relationName, relationSchema ] of __jymfony.getEntries(options.relations || {})) {
            const relation = {
                target: options.target || options.name,
                propertyName: relationName,
                relationType: relationSchema.type,
                isLazy: relationSchema.lazy || false,
                type: relationSchema.target,
                inverseSideProperty: relationSchema.inverseSide,
                isTreeParent: relationSchema.treeParent,
                isTreeChildren: relationSchema.treeChildren,
                options: {
                    eager: relationSchema.eager || false,
                    cascade: relationSchema.cascade,
                    nullable: relationSchema.nullable,
                    onDelete: relationSchema.onDelete,
                    onUpdate: relationSchema.onUpdate,
                    primary: relationSchema.primary,
                    persistence: relationSchema.persistence,
                },
            };

            metadataArgsStorage.relations.push(relation);

            // Add join column
            if (relationSchema.joinColumn) {
                const joinColumn = {
                    target: options.target || options.name,
                    propertyName: relationName,
                    name: relationSchema.joinColumn.name,
                    referencedColumnName: relationSchema.joinColumn.referencedColumnName,
                };

                metadataArgsStorage.joinColumns.push(joinColumn);
            }

            // Add join table
            if (relationSchema.joinTable) {
                const joinTable = {
                    target: options.target || options.name,
                    propertyName: relationName,
                    name: relationSchema.joinTable.name,
                    database: relationSchema.joinTable.database,
                    schema: relationSchema.joinTable.schema,
                    joinColumns: relationSchema.joinTable.joinColumn ? [ relationSchema.joinTable.joinColumn ] : relationSchema.joinTable.joinColumns,
                    inverseJoinColumns: relationSchema.joinTable.inverseJoinColumn ? [ relationSchema.joinTable.inverseJoinColumn ] : relationSchema.joinTable.inverseJoinColumns,
                };

                metadataArgsStorage.joinTables.push(joinTable);
            }
        }
    }

    /**
     * Process indices and uniques in schema.
     *
     * @param {MetadataArgsStorage} metadataArgsStorage
     * @param {EntitySchema} entitySchema
     *
     * @private
     */
    _processIndices(metadataArgsStorage, entitySchema) {
        const options = entitySchema.options;

        for (const index of options.indices || []) {
            const indexArgs = {
                target: options.target || options.name,
                name: index.name,
                unique: true === index.unique,
                spatial: true === index.spatial,
                fulltext: true === index.fulltext,
                synchronize: false !== index.synchronize,
                where: index.where,
                sparse: index.sparse,
                columns: index.columns,
            };

            metadataArgsStorage.indices.push(indexArgs);
        }

        for (const unique of options.uniques || []) {
            const uniqueArgs = {
                target: options.target || options.name,
                name: unique.name,
                columns: unique.columns,
            };

            metadataArgsStorage.uniques.push(uniqueArgs);
        }
    }

    /**
     * Evaluates repository schema option.
     *
     * @param {MetadataArgsStorage} metadataArgsStorage
     * @param {EntitySchema} entitySchema
     *
     * @private
     */
    _processRepository(metadataArgsStorage, entitySchema) {
        const repository = entitySchema.options.repository;
        if (! repository) {
            return;
        }

        const entity = entitySchema.options.target;
        const entityClass = new ReflectionClass(entity);

        const reflClass = new ReflectionClass(entitySchema.options.repository);
        if (! reflClass.isSubclassOf(AbstractRepository) && ! reflClass.isSubclassOf(Repository) ) {
            throw new LogicException(__jymfony.sprintf('"%s" is not a subclass of Repository', reflClass.name));
        }

        metadataArgsStorage.entityRepositories.push({
            target: reflClass.getConstructor(),
            entity: entityClass.getConstructor(),
        });
    }
}

module.exports = EntitySchemaTransformer;
