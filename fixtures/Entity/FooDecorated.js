const Column = Jymfony.Bundle.TypeORMBundle.Annotation.Column;
const Entity = Jymfony.Bundle.TypeORMBundle.Annotation.Entity;
const GeneratedValue = Jymfony.Bundle.TypeORMBundle.Annotation.GeneratedValue;
const JoinColumn = Jymfony.Bundle.TypeORMBundle.Annotation.JoinColumn;
const Id = Jymfony.Bundle.TypeORMBundle.Annotation.Id;
const ManyToOne = Jymfony.Bundle.TypeORMBundle.Annotation.ManyToOne;
const OneToOne = Jymfony.Bundle.TypeORMBundle.Annotation.OneToOne;

const Embedded = Jymfony.Bundle.TypeORMBundle.Fixtures.Entity.Embedded;
const LazyRelated = Jymfony.Bundle.TypeORMBundle.Fixtures.Entity.LazyRelated;
const RelatedDecorated = Jymfony.Bundle.TypeORMBundle.Fixtures.Entity.RelatedDecorated;
const FooRepository = Jymfony.Bundle.TypeORMBundle.Fixtures.Repository.FooRepository;

/**
 * @memberOf Jymfony.Bundle.TypeORMBundle.Fixtures.Entity
 */
export default
@Entity({ repository: FooRepository })
class FooDecorated {
    @Id()
    @Column(Number)
    @GeneratedValue()
    accessor _id;

    @Column({ type: String, nullable: true })
    accessor _name;

    @Column({ type: Embedded })
    accessor _embeds;

    @OneToOne({ target: RelatedDecorated, eager: true })
    @JoinColumn({ name: 'related_id' })
    accessor _related;

    @ManyToOne({ target: LazyRelated, lazy: true })
    @JoinColumn({ name: 'lazy_related_id' })
    accessor _lazyRelated;
}
