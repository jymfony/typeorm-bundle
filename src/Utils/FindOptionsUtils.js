import { FindOptionsUtils as Base } from 'typeorm/find-options/FindOptionsUtils';

/**
 * @memberOf Jymfony.Bundle.TypeORMBundle.Utils
 */
export default class FindOptionsUtils {
    /**
     * Patches the find options utils to allow circular eager relations.
     */
    static patch() {
        Base.joinEagerRelations = FindOptionsUtils.joinEagerRelations;
    }

    /**
     * Joins eager relations for a given entity.
     *
     * @param {SelectQueryBuilder} qb
     * @param {string} alias
     * @param {EntityMetadata} metadata
     * @param {Set<RelationMetadata>} visited
     */
    static joinEagerRelations(qb, alias, metadata, visited = new Set()) {
        metadata.eagerRelations.forEach(relation => {
            if (visited.has(relation)) {
                return;
            }

            visited.add(relation);
            if (relation.inverseRelation) {
                visited.add(relation.inverseRelation);
            }

            const relationAlias = alias + '_' + relation.propertyPath.replace('.', '_');
            qb.leftJoinAndSelect(alias + '.' + relation.propertyPath, relationAlias);

            __self.joinEagerRelations(qb, relationAlias, relation.inverseEntityMetadata, visited);
        });
    };
}
