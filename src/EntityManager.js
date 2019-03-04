const RepositoryNotFoundError = Jymfony.Bundle.TypeORMBundle.Exception.RepositoryNotFoundError;
const RepositoryFactory = Jymfony.Bundle.TypeORMBundle.Repository.RepositoryFactory;
const typeorm = require('typeorm');
const Base = typeorm.EntityManager;

/**
 * @memberOf Jymfony.Bundle.TypeORMBundle
 */
class EntityManager extends Base {
    constructor(connection, queryRunner = undefined) {
        super(connection, queryRunner);

        /**
         * @type {Jymfony.Bundle.TypeORMBundle.Repository.RepositoryFactory}
         *
         * @private
         */
        this._repositoryFactory = undefined;
    }

    getRepository(target) {
        // Throw exception if there is no repository with this target registered
        if (! this.connection.hasMetadata(target)) {
            throw new RepositoryNotFoundError(this.connection.name, target);
        }

        const metadata = this.connection.getMetadata(target);
        const repository = this.repositories.find(repository => repository.metadata === metadata);
        if (repository) {
            return repository;
        }

        const repositoryInstance = this._getRepositoryFactory().create(this, metadata, this.queryRunner);
        this.repositories.push(repositoryInstance);

        return repositoryInstance;
    }

    /**
     * Gets a repository factory instance.
     *
     * @returns {Jymfony.Bundle.TypeORMBundle.Repository.RepositoryFactory}
     *
     * @private
     */
    _getRepositoryFactory() {
        if (! this._repositoryFactory) {
            this._repositoryFactory = new RepositoryFactory();
        }

        return this._repositoryFactory;
    }
}

module.exports = EntityManager;
