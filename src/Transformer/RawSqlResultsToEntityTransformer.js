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

                for (const [ , value ] of __jymfony.getEntries(entity)) {
                    if (null !== value) {
                        entities.push(entity);
                        break;
                    }
                }
            });
            return entities;
        };
    }
}
