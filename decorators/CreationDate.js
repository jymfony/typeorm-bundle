import { @metadata } from '@jymfony/decorators';

export class CreationDate {
}

/**
 * CreationDate decorator.
 */
export decorator @CreationDate() {
    @metadata(CreationDate, new CreationDate())
}
