const Annotation = Jymfony.Component.Autoloader.Decorator.Annotation;
const Relation = Jymfony.Bundle.TypeORMBundle.Annotation.Relation;

/**
 * Many-to-one column.
 *
 * @memberOf Jymfony.Bundle.TypeORMBundle.Annotation
 */
@Annotation(Annotation.ANNOTATION_TARGET_ACCESSOR)
export default class ManyToOne extends Relation {
    __construct(opts = {}) {
        super.__construct(isFunction(opts)
            ? { target: opts, type: 'many-to-one', inverse: false }
            : { ...opts, type: 'many-to-one', inverse: false }
        );
    }
}
