import { @Annotation } from '@jymfony/decorators';

export class Id {
}

/**
 * Id decorator.
 */
export decorator @Id() {
    @Annotation(new Id())
}
