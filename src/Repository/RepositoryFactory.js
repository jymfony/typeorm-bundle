import { MongoRepository, Repository, TreeRepository, getMetadataArgsStorage } from 'typeorm';
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
            repository = new TreeRepository(metadata.target, manager, queryRunner);
        } else {
            repository = manager.connection.driver instanceof MongoDriver
                ? new MongoRepository(metadata.target, manager, queryRunner)
                : new Repository(metadata.target, manager, queryRunner);
        }

        return repository;
    }
}
