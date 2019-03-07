const EntityManager = Jymfony.Bundle.TypeORMBundle.EntityManager;
const ConnectionMetadataBuilder = Jymfony.Bundle.TypeORMBundle.Metadata.ConnectionMetadataBuilder;
const EntityMetadataValidator = Jymfony.Bundle.TypeORMBundle.Metadata.EntityMetadataValidator;
const UnderscoreNamingStrategy = Jymfony.Bundle.TypeORMBundle.NamingStrategy.UnderscoreNamingStrategy;

const typeorm = require('typeorm');
const Base = typeorm.Connection;
const { EntitySchema } = typeorm;

/**
 * @memberOf Jymfony.Bundle.TypeORMBundle.Connection
 */
class Connection extends Base {
    constructor(options) {
        super(options);

        this._metadataBuilt = false;
        this.namingStrategy = new UnderscoreNamingStrategy();
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
                if (-1 !== target.indexOf('.')) {
                    return metadata.tablePath === target;
                }
                return metadata.name === target || metadata.tableName === target;

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

        // Create subscribers instances if they are not disallowed from high-level (for example they can disallowed from migrations run process)
        const subscribers = connectionMetadataBuilder.buildSubscribers(this.options.subscribers || []);
        Object.assign(this, { subscribers: subscribers });

        // Build entity metadatas
        const entityMetadatas = connectionMetadataBuilder.buildEntityMetadatas(this.options.entities || []);
        Object.assign(this, { entityMetadatas: entityMetadatas });

        // Create migration instances
        const migrations = connectionMetadataBuilder.buildMigrations(this.options.migrations || []);
        Object.assign(this, { migrations: migrations });

        // Validate all created entity metadatas to make sure user created entities are valid and correct
        entityMetadataValidator.validateMany(this.entityMetadatas, this.driver);
    }
}

module.exports = Connection;
