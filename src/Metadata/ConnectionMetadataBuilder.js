import * as glob from 'glob';
import { EntitySchema, InstanceChecker, getFromContainer, getMetadataArgsStorage } from 'typeorm';
import { ConnectionMetadataBuilder as Base } from 'typeorm/connection/ConnectionMetadataBuilder';
import { ObjectUtils } from 'typeorm/util/ObjectUtils';
import { OrmUtils } from 'typeorm/util/OrmUtils';
import { PlatformTools } from 'typeorm/platform/PlatformTools';

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

        const allEntityClasses = [ ...entityClasses, ...this._importClassesFromDirectories(this.connection.logger, entityDirectories) ];
        allEntityClasses.forEach(entityClass => { // If we have entity schemas loaded from directories
            if (entityClass instanceof EntitySchema) {
                entitySchemas.push(entityClass);
                allEntityClasses.slice(allEntityClasses.indexOf(entityClass), 1);
            }
        });
        const decoratorEntityMetadatas = new EntityMetadataBuilder(this.connection, getMetadataArgsStorage()).build(allEntityClasses);

        const metadataArgsStorageFromSchema = new EntitySchemaTransformer().transform(entitySchemas);
        const schemaEntityMetadatas = new EntityMetadataBuilder(this.connection, metadataArgsStorageFromSchema).build();

        this._mergeMetadataArgs(getMetadataArgsStorage(), metadataArgsStorageFromSchema);

        const allMetadatas = [ ...decoratorEntityMetadatas, ...schemaEntityMetadatas ];
        const finalBuilder = new EntityMetadataBuilder(this.connection, getMetadataArgsStorage());
        for (const metadata of allMetadatas) {
            finalBuilder.computeInverseProperties(metadata, allMetadatas);
        }

        return allMetadatas;
    }

    buildSubscribers(subscribers) {
        const [ subscriberClasses, subscriberDirectories ] = OrmUtils.splitClassesAndStrings(subscribers || []);
        const allSubscriberClasses = [
            ...subscriberClasses,
            ...(this._importClassesFromDirectories(
                this.connection.logger,
                subscriberDirectories
            )),
        ];

        return getMetadataArgsStorage()
            .filterSubscribers(allSubscriberClasses)
            .map(metadata => getFromContainer(metadata.target));
    }

    _importClassesFromDirectories(logger, directories) {
        const logLevel = 'info';
        const classesNotFoundMessage = 'No classes were found using the provided glob pattern: ';
        const classesFoundMessage = 'All classes found using provided glob pattern';

        function loadFileClasses(exported, allLoaded) {
            if (
                'function' === typeof exported ||
                InstanceChecker.isEntitySchema(exported)
            ) {
                allLoaded.push(exported);
            } else if (Array.isArray(exported)) {
                exported.forEach((i) => loadFileClasses(i, allLoaded));
            } else if (ObjectUtils.isObject(exported)) {
                Object.keys(exported).forEach((key) =>
                    loadFileClasses(exported[key], allLoaded)
                );
            }

            return allLoaded;
        }

        const allFiles = directories.reduce((allDirs, dir) => allDirs.concat(glob.sync(PlatformTools.pathNormalize(dir))), []);
        if (0 < directories.length && 0 === allFiles.length) {
            logger.log(logLevel, `${classesNotFoundMessage} "${directories}"`);
        } else if (0 < allFiles.length) {
            logger.log(logLevel, `${classesFoundMessage} "${directories}" : "${allFiles}"`);
        }

        const dirs = allFiles
            .filter(file => '.js' === file.substring(file.length - 3, file.length))
            .map(file => require(file));

        return loadFileClasses(dirs, []);
    }

    _mergeMetadataArgs(...args) {
        /** @type {MetadataArgsStorage} */
        const target = args.shift();
        for (const storage of args) {
            target.tables = [ ...target.tables, ...storage.tables ];
            target.trees = [ ...target.trees, ...storage.trees ];
            target.entityRepositories = [ ...target.entityRepositories, ...storage.entityRepositories ];
            target.transactionEntityManagers = [ ...target.transactionEntityManagers, ...storage.transactionEntityManagers ];
            target.transactionRepositories = [ ...target.transactionRepositories, ...storage.transactionRepositories ];
            target.namingStrategies = [ ...target.namingStrategies, ...storage.namingStrategies ];
            target.entitySubscribers = [ ...target.entitySubscribers, ...storage.entitySubscribers ];
            target.indices = [ ...target.indices, ...storage.indices ];
            target.uniques = [ ...target.uniques, ...storage.uniques ];
            target.checks = [ ...target.checks, ...storage.checks ];
            target.exclusions = [ ...target.exclusions, ...storage.exclusions ];
            target.columns = [ ...target.columns, ...storage.columns ];
            target.generations = [ ...target.generations, ...storage.generations ];
            target.relations = [ ...target.relations, ...storage.relations ];
            target.joinColumns = [ ...target.joinColumns, ...storage.joinColumns ];
            target.joinTables = [ ...target.joinTables, ...storage.joinTables ];
            target.entityListeners = [ ...target.entityListeners, ...storage.entityListeners ];
            target.relationCounts = [ ...target.relationCounts, ...storage.relationCounts ];
            target.relationIds = [ ...target.relationIds, ...storage.relationIds ];
            target.embeddeds = [ ...target.embeddeds, ...storage.embeddeds ];
            target.inheritances = [ ...target.inheritances, ...storage.inheritances ];
            target.discriminatorValues = [ ...target.discriminatorValues, ...storage.discriminatorValues ];
        }
    }
}
