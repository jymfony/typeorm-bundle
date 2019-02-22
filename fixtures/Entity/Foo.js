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
            },
            repository: FooRepository,
        };
    }
}

module.exports = Foo;
