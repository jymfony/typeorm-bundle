export class Check {
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
     * Check constraint name.
     *
     * @returns {string}
     */
    get name() {
        return this._name;
    }

    /**
     * Check expression.
     *
     * @returns {string}
     */
    get expression() {
        return this._expression;
    }
}

/**
 * Check decorator.
 *
 * @param {object|string[]} [opts]
 * @param {string} [opts.name]
 * @param {string} [opts.expression]
 */
export decorator @Check(opts = {}) {
    @register((target, prop, parameterIndex = null) => {
        if (null !== parameterIndex || !! prop) {
            throw new Error('Exclude decorator can only be used on classes');
        }

        MetadataStorage.addMetadata(Check, new Check(opts), target, prop);
    })
}
