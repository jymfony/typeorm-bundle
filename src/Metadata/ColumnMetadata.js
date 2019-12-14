import { ColumnMetadata as Base } from 'typeorm/metadata/ColumnMetadata';

/**
 * @memberOf Jymfony.Bundle.TypeORMBundle.Metadata
 */
class ColumnMetadata extends Base {
    setEntityValue(entity, value) {
        if (this.embeddedMetadata) {
            // First step - we extract all parent properties of the entity relative to this column, e.g. [data, information, counters]
            const extractEmbeddedColumnValue = (embeddedMetadatas, map) => {
                const embeddedMetadata = embeddedMetadatas.shift();
                if (embeddedMetadata) {
                    if (!map[embeddedMetadata.propertyName]) {
                        map[embeddedMetadata.propertyName] = embeddedMetadata.create(entity);
                    }

                    extractEmbeddedColumnValue(embeddedMetadatas, map[embeddedMetadata.propertyName]);

                    return map;
                }

                map[this.propertyName] = value;
                return map;
            };

            return extractEmbeddedColumnValue([ ...this.embeddedMetadata.embeddedMetadataTree ], entity);
        }
        entity[this.propertyName] = value;

    }
}

module.exports = ColumnMetadata;
