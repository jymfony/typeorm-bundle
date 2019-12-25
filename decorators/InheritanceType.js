import { @Annotation } from '@jymfony/decorators';

export class InheritanceType {
    __construct(type) {
        if ('SINGLE_TABLE' !== type) {
            throw new Exception('The only inheritance type supported is "SINGLE_TABLE". Use mapped superclass if you want to create more than one table.');
        }

        /**
         * @type {string}
         *
         * @private
         */
        this._type = type;
    }

    /**
     * Gets the inheritance type.
     *
     * @returns {string}
     */
    get type() {
        return this._type;
    }
}

/**
 * Id decorator.
 */
export decorator @InheritanceType(type) {
    @Annotation(new InheritanceType(type))
}
