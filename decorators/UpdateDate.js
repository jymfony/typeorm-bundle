import { @metadata } from '@jymfony/decorators';

export class UpdateDate {
}

/**
 * UpdateDate decorator.
 */
export decorator @UpdateDate() {
    @metadata(UpdateDate, new UpdateDate())
}
