import { @metadata } from '@jymfony/decorators';

export class GeneratedValue {
    __construct(opts = {}) {
        if (isBoolean(opts)) {
            opts = { strategy: true };
        }

        /**
         * @type {boolean|string}
         *
         * @private
         */
        this._strategy = opts.strategy;
    }

    /**
     * Specifies the strategy to use while generating value for this column.
     *
     * @returns {boolean|string}
     */
    get strategy() {
        return this._strategy;
    }
}

/**
 * GeneratedValue decorator.
 *
 * @param {object|boolean|string} [opts]
 * @param {string} [opts.strategy]
 */
export decorator @GeneratedValue(opts = true) {
    @metadata(GeneratedValue, new GeneratedValue())
}
