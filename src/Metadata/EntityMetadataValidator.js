const Base = require('typeorm/metadata-builder/EntityMetadataValidator').EntityMetadataValidator;

/**
 * @memberOf Jymfony.Bundle.TypeORMBundle.Metadata
 */
class EntityMetadataValidator extends Base {
    validateEagerRelations(entityMetadatas) { // eslint-disable-line no-unused-vars
        // Do nothing.
    }
}

module.exports = EntityMetadataValidator;
