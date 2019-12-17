import { @metadata } from '@jymfony/decorators';

export class DiscriminatorColumn {
    __construct(opts = {}) {
        if (isString(opts)) {
            opts = { name: opts };
        }

        /**
         * @type {string}
         *
         * @private
         */
        this._name = opts.name || 'discr';

        /**
         * @type {*}
         *
         * @private
         */
        this._type = opts.type || String;
    }

    /**
     * Gets the discriminator column name.
     *
     * @returns {string}
     */
    get name() {
        return this._name;
    }

    /**
     * The discriminator column type.
     * Accepts all the types the @Column decorator accepts, except
     * the embeddable types.
     *
     * @returns {*}
     */
    get type() {
        return this._type;
    }
}

/**
 * DiscriminatorColumn decorator.
 *
 * @param {object|string} [options = {}]
 * @param {string} [options.name]
 * @param {Function|string} [options.type]
 */
export decorator @DiscriminatorColumn(opts = {}) {
    @metadata(DiscriminatorColumn, new DiscriminatorColumn(opts))
}
