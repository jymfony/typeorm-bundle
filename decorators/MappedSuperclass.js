import { @Annotation } from '@jymfony/decorators';

export class MappedSuperclass {
}

/**
 * Id decorator.
 */
export decorator @MappedSuperclass() {
    @Annotation(new MappedSuperclass())
}
