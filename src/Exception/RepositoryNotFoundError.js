const EntitySchema = Jymfony.Bundle.TypeORMBundle.Metadata.EntitySchema;

/**
 * @memberOf Jymfony.Bundle.TypeORMBundle.Exception
 */
export default class RepositoryNotFoundError extends RuntimeException {
    __construct(connectionName, entityClass) {
        this.name = 'RepositoryNotFoundError';

        let targetName;
        if (entityClass instanceof EntitySchema) {
            targetName = entityClass.options.name;
        } else if (isFunction(entityClass)) {
            targetName = entityClass.name;
        } else {
            targetName = entityClass;
        }

        super.__construct(__jymfony.sprintf(
            'No repository for "%s" was found. Looks like this entity is not registered in current "%s" connection?',
            targetName,
            connectionName
        ));
    }
}
