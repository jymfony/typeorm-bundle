import { @metadata } from '@jymfony/decorators';

export class MappedSuperclass {
}

/**
 * Id decorator.
 */
export decorator @MappedSuperclass() {
    @metadata(MappedSuperclass, new MappedSuperclass())
}
