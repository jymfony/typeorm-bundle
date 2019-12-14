import { @Column, @Entity, @GeneratedValue, @Id, @OneToOne } from '../../decorators';

const FooDecorated = Jymfony.Bundle.TypeORMBundle.Fixtures.Entity.FooDecorated;

/**
 * @memberOf Jymfony.Bundle.TypeORMBundle.Fixtures.Entity
 */
@Entity()
export default class RelatedDecorated {
    @Id()
    @Column(Number)
    @GeneratedValue()
    _id;

    @Column({ type: String, nullable: false })
    _name;

    @OneToOne({ target: FooDecorated, eager: true })
    _foo;
}
