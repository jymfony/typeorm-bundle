const Base = require('typeorm/metadata-builder/EntityMetadataValidator').EntityMetadataValidator;

/**
 * @memberOf Jymfony.Bundle.TypeORMBundle.Metadata
 */
class EntityMetadataValidator extends Base {
    validateEagerRelations(entityMetadatas) {
        // Do nothing.
    }
}

module.exports = EntityMetadataValidator;
