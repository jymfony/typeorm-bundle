const Connection = Jymfony.Bundle.TypeORMBundle.Connection.Connection;
const Entity = Jymfony.Bundle.TypeORMBundle.Fixtures.Entity;
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
        const fooSchema = Entity.Foo[Symbol.for('entitySchema')]();
        const relatedSchema = Entity.Related[Symbol.for('entitySchema')]();
        const embeddedSchema = Entity.Embedded[Symbol.for('entitySchema')]();
        const lazyRelatedSchema = Entity.LazyRelated[Symbol.for('entitySchema')]();
        fooSchema.target = (new ReflectionClass(Entity.Foo)).getConstructor();
        relatedSchema.target = (new ReflectionClass(Entity.Related)).getConstructor();
        embeddedSchema.target = (new ReflectionClass(Entity.Embedded)).getConstructor();
        lazyRelatedSchema.target = (new ReflectionClass(Entity.LazyRelated)).getConstructor();

        const connection = new Connection({
            type: 'sqlite',
            database: ':memory:',
            entities: [
                new EntitySchema(fooSchema),
                new EntitySchema(relatedSchema),
                new EntitySchema(embeddedSchema),
                new EntitySchema(lazyRelatedSchema),
            ],
        });

        const metadata = connection.findMetadata(Entity.Foo);
        expect(metadata).to.be.not.undefined;
        expect(metadata.target).to.be.equal(fooSchema.target);
    });
});
