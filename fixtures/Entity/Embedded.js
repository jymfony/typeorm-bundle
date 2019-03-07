/**
 * @memberOf Jymfony.Bundle.TypeORMBundle.Fixtures.Entity
 */
class Embedded {
    /**
     * Gets the entity schema.
     *
     * @returns {*}
     */
    static [Symbol.for('entitySchema')]() {
        return {
            embeddable: true,
            columns: {
                _externalId: { type: String, nullable: false },
                _updatedAt: { type: Date, nullable: false, updateDate: true },
            },
        };
    }
}

module.exports = Embedded;
