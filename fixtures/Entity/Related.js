const Foo = Jymfony.Bundle.TypeORMBundle.Fixtures.Entity.Foo;

/**
 * @memberOf Jymfony.Bundle.TypeORMBundle.Fixtures.Entity
 */
class Related {
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
            relations: {
                _foo: {
                    target: Foo,
                    type: 'one-to-one',
                    eager: true,
                },
            },
        };
    }
}

module.exports = Related;
