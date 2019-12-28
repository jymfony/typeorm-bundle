/**
 * @memberOf Jymfony.Bundle.TypeORMBundle.Fixtures.Entity
 */
class Embedded {
    __construct() {
        this._externalId = undefined;
        this._updatedAt = undefined;
    }

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
