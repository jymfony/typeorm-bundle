const Connection = Jymfony.Bundle.TypeORMBundle.Connection.Connection;
const Embedded = Jymfony.Bundle.TypeORMBundle.Fixtures.Entity.Embedded;
const Foo = Jymfony.Bundle.TypeORMBundle.Fixtures.Entity.Foo;
const Related = Jymfony.Bundle.TypeORMBundle.Fixtures.Entity.Related;
const expect = require('chai').expect;
const { EntitySchema } = require('typeorm');

describe('Connection', function () {
    it('could be created', () => {
        new Connection({
            type: 'sqlite',
            database: ':memory:',
        });
    });

    it('findMetadata should return metadata from autoloaded classes', () => {
        const fooSchema = Foo[Symbol.for('entitySchema')]();
        const relatedSchema = Related[Symbol.for('entitySchema')]();
        const embeddedSchema = Embedded[Symbol.for('entitySchema')]();
        fooSchema.target = (new ReflectionClass(Foo)).getConstructor();
        relatedSchema.target = (new ReflectionClass(Related)).getConstructor();
        embeddedSchema.target = (new ReflectionClass(Embedded)).getConstructor();

        const connection = new Connection({
            type: 'sqlite',
            database: ':memory:',
            entities: [
                new EntitySchema(fooSchema),
                new EntitySchema(relatedSchema),
                new EntitySchema(embeddedSchema),
            ],
        });

        const metadata = connection.findMetadata(Foo);
        expect(metadata).to.be.not.undefined;
        expect(metadata.target).to.be.equal(fooSchema.target);
    });
});
