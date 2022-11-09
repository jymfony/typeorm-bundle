const Annotation = Jymfony.Component.Autoloader.Decorator.Annotation;
const Relation = Jymfony.Bundle.TypeORMBundle.Annotation.Relation;

/**
 * Many-to-many column.
 *
 * @memberOf Jymfony.Bundle.TypeORMBundle.Annotation
 */
export default
@Annotation(Annotation.ANNOTATION_TARGET_ACCESSOR)
class ManyToMany extends Relation {
    __construct(opts = {}) {
        super.__construct(isFunction(opts) ? { target: opts, type: 'many-to-many' } : { ...opts, type: 'many-to-many' });
    }
}
