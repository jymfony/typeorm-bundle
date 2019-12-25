import { @Annotation } from '@jymfony/decorators';

export class CreationDate {
}

/**
 * CreationDate decorator.
 */
export decorator @CreationDate() {
    @Annotation(new CreationDate())
}
