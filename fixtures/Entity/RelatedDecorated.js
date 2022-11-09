const Column = Jymfony.Bundle.TypeORMBundle.Annotation.Column;
const Entity = Jymfony.Bundle.TypeORMBundle.Annotation.Entity;
const GeneratedValue = Jymfony.Bundle.TypeORMBundle.Annotation.GeneratedValue;
const Id = Jymfony.Bundle.TypeORMBundle.Annotation.Id;
const OneToOne = Jymfony.Bundle.TypeORMBundle.Annotation.OneToOne;

const FooDecorated = Jymfony.Bundle.TypeORMBundle.Fixtures.Entity.FooDecorated;

/**
 * @memberOf Jymfony.Bundle.TypeORMBundle.Fixtures.Entity
 */
export default
@Entity()
class RelatedDecorated {
    @Id()
    @Column(Number)
    @GeneratedValue()
    accessor _id;

    @Column({ type: String, nullable: false })
    accessor _name;

    @OneToOne({ target: FooDecorated, eager: true })
    accessor _foo;
}
