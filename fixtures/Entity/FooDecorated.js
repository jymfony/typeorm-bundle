import { @Column, @Entity, @GeneratedValue, @Id, @ManyToOne, @OneToOne } from '../../decorators';

const Embedded = Jymfony.Bundle.TypeORMBundle.Fixtures.Entity.Embedded;
const LazyRelated = Jymfony.Bundle.TypeORMBundle.Fixtures.Entity.LazyRelated;
const RelatedDecorated = Jymfony.Bundle.TypeORMBundle.Fixtures.Entity.RelatedDecorated;
const FooRepository = Jymfony.Bundle.TypeORMBundle.Fixtures.Repository.FooRepository;

/**
 * @memberOf Jymfony.Bundle.TypeORMBundle.Fixtures.Entity
 */
@Entity({ repository: FooRepository })
export default class FooDecorated {
    @Id()
    @Column(Number)
    @GeneratedValue()
    _id;

    @Column({ type: String, nullable: true })
    _name;

    @Column({ type: Embedded })
    _embeds;

    @OneToOne({ target: RelatedDecorated, eager: true })
    _related;

    @ManyToOne({ target: LazyRelated, lazy: true })
    _lazyRelated;
}
