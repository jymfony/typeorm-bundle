import { EntitySchema, getMetadataArgsStorage } from 'typeorm';
import { ConnectionMetadataBuilder as Base } from 'typeorm/connection/ConnectionMetadataBuilder';
import { OrmUtils } from 'typeorm/util/OrmUtils';
import { importClassesFromDirectories } from 'typeorm/util/DirectoryExportedClassesLoader';

const EntityMetadataBuilder = Jymfony.Bundle.TypeORMBundle.Metadata.EntityMetadataBuilder;
const EntitySchemaTransformer = Jymfony.Bundle.TypeORMBundle.Metadata.EntitySchemaTransformer;

/**
 * @memberOf Jymfony.Bundle.TypeORMBundle.Metadata
 */
export default class ConnectionMetadataBuilder extends Base {
    /**
     * Builds entity metadatas for the given classes or directories.
     *
     * @param {(Function | EntitySchema<any> | string)[]} entities
     *
     * @returns {EntityMetadata[]}
     */
    buildEntityMetadatas(entities) {
        const [ entityClassesOrSchemas, entityDirectories ] = OrmUtils.splitClassesAndStrings(entities || []);
        const entityClasses = entityClassesOrSchemas.filter(entityClass => ! (entityClass instanceof EntitySchema));
        const entitySchemas = entityClassesOrSchemas.filter(entityClass => entityClass instanceof EntitySchema);

        const allEntityClasses = [ ...entityClasses, ...importClassesFromDirectories(this.connection.logger, entityDirectories) ];
        allEntityClasses.forEach(entityClass => { // If we have entity schemas loaded from directories
            if (entityClass instanceof EntitySchema) {
                entitySchemas.push(entityClass);
                allEntityClasses.slice(allEntityClasses.indexOf(entityClass), 1);
            }
        });
        const decoratorEntityMetadatas = new EntityMetadataBuilder(this.connection, getMetadataArgsStorage()).build(allEntityClasses);

        const metadataArgsStorageFromSchema = new EntitySchemaTransformer().transform(entitySchemas);
        const schemaEntityMetadatas = new EntityMetadataBuilder(this.connection, metadataArgsStorageFromSchema).build();

        return [ ...decoratorEntityMetadatas, ...schemaEntityMetadatas ];
    }
}
