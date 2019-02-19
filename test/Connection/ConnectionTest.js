const Connection = Jymfony.Bundle.TypeORMBundle.Connection.Connection;
const Foo = Jymfony.Bundle.TypeORMBundle.Fixtures.Entity.Foo;
const expect = require('chai').expect;
const { EntitySchema } = require('typeorm');

describe('Connection', function () {
    it('could be created', () => {
        new Connection({
            type: 'sqlite',
            database: ':memory:'
        });
    });

    it('findMetadata should return metadata from autoloaded classes', () => {
        const fooSchema = Foo[Symbol.for('entitySchema')]();
        fooSchema.target = (new ReflectionClass(Foo)).getConstructor();

        const connection = new Connection({
            type: 'sqlite',
            database: ':memory:',
            entities: [
                new EntitySchema(fooSchema),
            ],
        });

        const metadata = connection.findMetadata(Foo);
        expect(metadata).to.be.not.undefined;
        expect(metadata.target).to.be.equal(Foo);
    })
});
