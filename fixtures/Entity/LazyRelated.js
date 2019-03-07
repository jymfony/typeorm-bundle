/**
 * @memberOf Jymfony.Bundle.TypeORMBundle.Fixtures.Entity
 */
class LazyRelated {
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
        };
    }
}

module.exports = LazyRelated;
