import { @Annotation } from '@jymfony/decorators';

export class UpdateDate {
}

/**
 * UpdateDate decorator.
 */
export decorator @UpdateDate() {
    @Annotation(new UpdateDate())
}
