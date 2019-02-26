const EntityMetadataBuilder = Jymfony.Bundle.TypeORMBundle.Metadata.EntityMetadataBuilder;
const Base = require('typeorm/connection/ConnectionMetadataBuilder').ConnectionMetadataBuilder;
const { EntitySchema, getMetadataArgsStorage } = require('typeorm');
const { EntitySchemaTransformer } = require('typeorm/entity-schema/EntitySchemaTransformer');
const { importClassesFromDirectories } = require('typeorm/util/DirectoryExportedClassesLoader');
const { OrmUtils } = require('typeorm/util/OrmUtils');

/**
 * @memberOf Jymfony.Bundle.TypeORMBundle.Metadata
 */
class ConnectionMetadataBuilder extends Base {
    buildEntityMetadatas(entities) {
        const [entityClassesOrSchemas, entityDirectories] = OrmUtils.splitClassesAndStrings(entities || []);
        const entityClasses = entityClassesOrSchemas.filter(entityClass => (entityClass instanceof EntitySchema) === false);
        const entitySchemas = entityClassesOrSchemas.filter(entityClass => entityClass instanceof EntitySchema);

        const allEntityClasses = [...entityClasses, ...importClassesFromDirectories(entityDirectories)];
        allEntityClasses.forEach(entityClass => { // if we have entity schemas loaded from directories
            if (entityClass instanceof EntitySchema) {
                entitySchemas.push(entityClass);
                allEntityClasses.slice(allEntityClasses.indexOf(entityClass), 1);
            }
        });
        const decoratorEntityMetadatas = new EntityMetadataBuilder(this.connection, getMetadataArgsStorage()).build(allEntityClasses);

        const metadataArgsStorageFromSchema = new EntitySchemaTransformer().transform(entitySchemas);
        const schemaEntityMetadatas = new EntityMetadataBuilder(this.connection, metadataArgsStorageFromSchema).build();

        return [...decoratorEntityMetadatas, ...schemaEntityMetadatas];
    }
}

module.exports = ConnectionMetadataBuilder;
