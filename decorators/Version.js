import { @Annotation } from '@jymfony/decorators';

export class Version {
}

/**
 * Version decorator.
 */
export decorator @Version() {
    @Annotation(new Version())
}
