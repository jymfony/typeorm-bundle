const Annotation = Jymfony.Component.Autoloader.Decorator.Annotation;
const Relation = Jymfony.Bundle.TypeORMBundle.Annotation.Relation;

/**
 * One-to-one column.
 *
 * @memberOf Jymfony.Bundle.TypeORMBundle.Annotation
 */
export default
@Annotation(Annotation.ANNOTATION_TARGET_ACCESSOR)
class OneToOne extends Relation {
    __construct(opts = {}) {
        super.__construct(isFunction(opts) ? { target: opts, type: 'one-to-one' } : { ...opts, type: 'one-to-one' });
    }
}
