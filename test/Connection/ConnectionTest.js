const Connection = Jymfony.Bundle.TypeORMBundle.Connection.Connection;
const Entity = Jymfony.Bundle.TypeORMBundle.Fixtures.Entity;
const EntitySchema = Jymfony.Bundle.TypeORMBundle.Metadata.EntitySchema;
const TestCase = Jymfony.Component.Testing.Framework.TestCase;

export default class ConnectionTest extends TestCase {
    testCouldBeCreated() {
        this.setTimeout(10000);
        new Connection({
            type: 'sqlite',
            database: ':memory:',
        });
    }

    testFindMetadataShouldReturnMetadataFromAutoloadedClasses() {
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

        __self.assertNotNull(metadata);
        __self.assertEquals(fooSchema.target, metadata.target);
    }
}
