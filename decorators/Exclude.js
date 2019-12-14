export class Exclude {
    __construct(opts) {
        if (isString(opts)) {
            opts = { expression: opts };
        }

        /**
         * @type {string}
         *
         * @private
         */
        this._name = opts.name;

        /**
         * @type {string}
         *
         * @private
         */
        this._expression = opts.expression;
    }

    /**
     * Exclusion constraint name.
     *
     * @returns {string}
     */
    get name() {
        return this._name;
    }

    /**
     * Exclusion expression.
     *
     * @returns {string}
     */
    get expression() {
        return this._expression;
    }
}

/**
 * Exclude decorator.
 *
 * @param {object|string[]} [opts]
 * @param {string} [opts.name]
 * @param {string} [opts.expression]
 */
export decorator @Exclude(opts = {}) {
    @register((target, prop, parameterIndex = null) => {
        if (null !== parameterIndex || !! prop) {
            throw new Error('Exclude decorator can only be used on classes');
        }

        MetadataStorage.addMetadata(Exclude, new Exclude(opts), target, prop);
    })
}
