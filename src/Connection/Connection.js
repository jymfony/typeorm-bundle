const EntityManager = Jymfony.Bundle.TypeORMBundle.EntityManager;
const ConnectionMetadataBuilder = Jymfony.Bundle.TypeORMBundle.Metadata.ConnectionMetadataBuilder;

const typeorm = require('typeorm');
const Base = typeorm.Connection;
const {
    AbstractRepository,
    EntitySchema,
    Repository,
    getMetadataArgsStorage
} = typeorm;
const { EntityMetadataValidator } = require('typeorm/metadata-builder/EntityMetadataValidator');

/**
 * @memberOf Jymfony.Bundle.TypeORMBundle.Connection
 */
class Connection extends Base {
    constructor(options) {
        super(options);

        this._metadataBuilt = false;
        this.buildMetadatas();
    }

    /**
     * @inheritDoc
     */
    createEntityManager(queryRunner) {
        return new EntityManager(this, queryRunner);
    }

    /**
     * @inheritdoc
     */
    findMetadata(target) {
        if (ReflectionClass.exists(target)) {
            target = (new ReflectionClass(target)).getConstructor();
        }

        return this.entityMetadatas.find(metadata => {
            if (metadata.target === target) {
                return true;
            }

            if (target instanceof EntitySchema) {
                return metadata.name === target.options.name;
            }

            if (isString(target)) {
                if (target.indexOf(".") !== -1) {
                    return metadata.tablePath === target;
                } else {
                    return metadata.name === target || metadata.tableName === target;
                }
            }

            return false;
        });
    }

    /**
     * @inheritdoc
     */
    buildMetadatas() {
        if (this._metadataBuilt) {
            return;
        }

        this._metadataBuilt = true;

        const connectionMetadataBuilder = new ConnectionMetadataBuilder(this);
        const entityMetadataValidator = new EntityMetadataValidator();

        // create subscribers instances if they are not disallowed from high-level (for example they can disallowed from migrations run process)
        const subscribers = connectionMetadataBuilder.buildSubscribers(this.options.subscribers || []);
        Object.assign(this, { subscribers: subscribers });

        // build entity metadatas
        const entityMetadatas = connectionMetadataBuilder.buildEntityMetadatas(this.options.entities || []);
        Object.assign(this, { entityMetadatas: entityMetadatas });

        // create migration instances
        const migrations = connectionMetadataBuilder.buildMigrations(this.options.migrations || []);
        Object.assign(this, { migrations: migrations });

        // validate all created entity metadatas to make sure user created entities are valid and correct
        entityMetadataValidator.validateMany(this.entityMetadatas, this.driver);

        for (const entitySchema of this.options.entities || []) {
            const repository = entitySchema.options.repository;
            if (! repository) {
                continue;
            }

            const entity = entitySchema.options.target;
            const entityClass = new ReflectionClass(entity);

            const reflClass = new ReflectionClass(entitySchema.options.repository);
            if (! reflClass.isSubclassOf(AbstractRepository) && ! reflClass.isSubclassOf(Repository) ) {
                throw new LogicException(__jymfony.sprintf('"%s" is not a subclass of Repository', reflClass.name));
            }

            getMetadataArgsStorage().entityRepositories.push({
                target: reflClass.getConstructor(),
                entity: entityClass.getConstructor(),
            });
        }
    }
}

module.exports = Connection;
