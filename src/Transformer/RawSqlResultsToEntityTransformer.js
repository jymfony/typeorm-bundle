import { RawSqlResultsToEntityTransformer as Base } from 'typeorm/query-builder/transformer/RawSqlResultsToEntityTransformer';

/**
 * @memberOf Jymfony.Bundle.TypeORMBundle.Transformer
 */
export default class RawSqlResultsToEntityTransformer {
    static patch() {
        Base.prototype.transform = function (rawResults, alias) {
            const group = this.group(rawResults, alias);
            const entities = [];
            group.forEach((results) => {
                const entity = this.transformRawResultsGroup(results, alias);
                if (entity === undefined) {
                    return;
                }

                const reflectionClass = new ReflectionClass(entity);
                for (const fieldName of reflectionClass.fields) {
                    const field = reflectionClass.getField(fieldName);
                    field.accessible = true;
                    const value = field.getValue(entity);

                    if (null !== value) {
                        entities.push(entity);
                        return;
                    }
                }

                for (const fieldName of reflectionClass.properties) {
                    if (! reflectionClass.hasReadableProperty(fieldName)) {
                        continue;
                    }

                    const field = reflectionClass.getReadableProperty(fieldName);
                    field.accessible = true;
                    const value = field.invoke(entity);

                    if (null !== value) {
                        entities.push(entity);
                        return;
                    }
                }
            });
            return entities;
        };
    }
}
