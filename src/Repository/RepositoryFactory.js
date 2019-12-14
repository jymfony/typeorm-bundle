import { AbstractRepository, MongoRepository, Repository, TreeRepository, getMetadataArgsStorage } from 'typeorm';
import { MongoDriver } from 'typeorm/driver/mongodb/MongoDriver';

/**
 * Factory used to create different types of repositories.
 *
 * @memberOf Jymfony.Bundle.TypeORMBundle.Repository
 */
export default class RepositoryFactory {
    __construct(metadataArgsStorage = getMetadataArgsStorage()) {
        /**
         * @type {MetadataArgsStorage}
         *
         * @private
         */
        this._metadataArgsStorage = metadataArgsStorage;
    }

    /**
     * Creates a repository.
     *
     * @param {EntityManager} manager
     * @param {EntityMetadata} metadata
     * @param {QueryRunner} queryRunner
     */
    create(manager, metadata, queryRunner = undefined) {
        let repository;
        const entityRepositoryMetadataArgs = this._metadataArgsStorage.entityRepositories.find(repository => repository.entity === metadata.target);
        if (entityRepositoryMetadataArgs) {
            const repositoryClass = entityRepositoryMetadataArgs.target;
            repository = new repositoryClass(manager, metadata);
        } else if (metadata.treeType) {
            // NOTE: dynamic access to protected properties. We need this to prevent unwanted properties in those classes to be exposed,
            // However we need these properties for internal work of the class
            repository = new TreeRepository();

            Object.assign(repository, {
                queryRunner: queryRunner,
            });
        } else {
            // NOTE: dynamic access to protected properties. We need this to prevent unwanted properties in those classes to be exposed,
            // However we need these properties for internal work of the class
            repository = manager.connection.driver instanceof MongoDriver ? new MongoRepository() : new Repository();

            Object.assign(repository, {
                queryRunner: queryRunner,
            });
        }

        if (repository instanceof AbstractRepository && ! repository.manager) {
            repository['manager'] = manager;
        }

        if (repository instanceof Repository) {
            repository['manager'] = manager;
            repository['metadata'] = metadata;
        }

        return repository;
    }
}
