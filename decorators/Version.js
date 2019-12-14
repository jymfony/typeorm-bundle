import { @metadata } from '@jymfony/decorators';

export class Version {
}

/**
 * Version decorator.
 */
export decorator @Version() {
    @metadata(Version, new Version())
}
