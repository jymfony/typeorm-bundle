import { FindOptionsUtils as Base } from 'typeorm/find-options/FindOptionsUtils';
import { DriverUtils } from 'typeorm/driver/DriverUtils';

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

            // Generate a relation alias
            let relationAlias = DriverUtils.buildAlias(qb.connection.driver, { joiner: '__' }, alias, relation.propertyPath);
            // Add a join for the relation
            // Checking whether the relation wasn't joined yet.
            let addJoin = true;
            for (const join of qb.expressionMap.joinAttributes) {
                if (join.condition !== undefined ||
                    join.mapToProperty !== undefined ||
                    join.isMappingMany !== undefined ||
                    'LEFT' !== join.direction ||
                    join.entityOrProperty !==
                    `${alias}.${relation.propertyPath}`) {
                    continue;
                }
                addJoin = false;
                relationAlias = join.alias.name;
                break;
            }

            if (addJoin) {
                qb.leftJoin(alias + '.' + relation.propertyPath, relationAlias);
            }

            // Checking whether the relation wasn't selected yet.
            // This check shall be after the join check to detect relationAlias.
            let addSelect = true;
            for (const select of qb.expressionMap.selects) {
                if (select.aliasName !== undefined ||
                    select.virtual !== undefined ||
                    select.selection !== relationAlias) {
                    continue;
                }
                addSelect = false;
                break;
            }

            if (addSelect) {
                qb.addSelect(relationAlias);
            }

            // (recursive) join the eager relations
            __self.joinEagerRelations(qb, relationAlias, relation.inverseEntityMetadata, visited);
        });
    };
}
