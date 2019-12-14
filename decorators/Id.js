import { @metadata } from '@jymfony/decorators';

export class Id {
}

/**
 * Id decorator.
 */
export decorator @Id() {
    @metadata(Id, new Id())
}
