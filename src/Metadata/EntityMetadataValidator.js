import { EntityMetadataValidator as Base } from 'typeorm/metadata-builder/EntityMetadataValidator';

/**
 * @memberOf Jymfony.Bundle.TypeORMBundle.Metadata
 */
export default class EntityMetadataValidator extends Base {
    validateEagerRelations(entityMetadatas) { // eslint-disable-line no-unused-vars
        // Do nothing.
    }
}
