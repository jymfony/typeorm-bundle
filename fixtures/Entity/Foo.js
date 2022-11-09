const Embedded = Jymfony.Bundle.TypeORMBundle.Fixtures.Entity.Embedded;
const LazyRelated = Jymfony.Bundle.TypeORMBundle.Fixtures.Entity.LazyRelated;
const Related = Jymfony.Bundle.TypeORMBundle.Fixtures.Entity.Related;
const FooRepository = Jymfony.Bundle.TypeORMBundle.Fixtures.Repository.FooRepository;

/**
 * @memberOf Jymfony.Bundle.TypeORMBundle.Fixtures.Entity
 */
class Foo {
    /**
     * Gets the entity schema.
     *
     * @returns {*}
     */
    static [Symbol.for('entitySchema')]() {
        return {
            columns: {
                _id: { type: Number, primary: true, generated: true },
                _name: { type: String, nullable: false },
                _embeds: { type: Embedded },
            },
            relations: {
                _related: {
                    target: Related,
                    type: 'one-to-one',
                    eager: true,
                    joinColumn: true,
                },
                _lazyRelated: {
                    target: LazyRelated,
                    type: 'many-to-one',
                    lazy: true,
                },
            },
            repository: FooRepository,
        };
    }
}

module.exports = Foo;
