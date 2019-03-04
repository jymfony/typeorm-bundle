/**
 * @memberOf Jymfony.Bundle.TypeORMBundle.Utils
 */
class MetadataUtils {
    /**
     * Gets given's entity all inherited classes.
     * Gives in order from parents to children.
     * For example Post extends ContentModel which extends Unit it will give
     * [Unit, ContentModel, Post]
     */
    static getInheritanceTree(entity) {
        return Array.from((function * () {
            let reflClass = new ReflectionClass(entity);
            yield reflClass.getConstructor();

            while ((reflClass = reflClass.getParentClass())) {
                yield reflClass.getConstructor();
            }
        })()).filter(c => c !== __jymfony.JObject);
    }

    /**
     * Checks if this table is inherited from another table.
     */
    static isInherited(target1, target2) {
        const reflClass1 = new ReflectionClass(target1);

        return reflClass1.isSubclassOf(target2);
    }
}

module.exports = MetadataUtils;
