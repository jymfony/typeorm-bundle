const ConnectionManager = Jymfony.Bundle.TypeORMBundle.Connection.ConnectionManager;
const Entity = Jymfony.Bundle.TypeORMBundle.Fixtures.Entity;
const TestCase = Jymfony.Component.Testing.Framework.TestCase;

export default class ConnectionManagerTest extends TestCase {
    testShouldLoadStaticMetadata() {
        const manager = new ConnectionManager({
            default: {
                driver: 'sqlite',
                database: ':memory:',
                mappings: [
                    'Jymfony.Bundle.TypeORMBundle.Fixtures.Entity.Foo',
                    'Jymfony.Bundle.TypeORMBundle.Fixtures.Entity.Related',
                    'Jymfony.Bundle.TypeORMBundle.Fixtures.Entity.Embedded',
                    'Jymfony.Bundle.TypeORMBundle.Fixtures.Entity.LazyRelated',
                ],
            },
        }, 'default');

        const connection = manager.get();
        const metadata = connection.findMetadata(Entity.Foo);

        __self.assertNotNull(metadata);
        __self.assertEquals(new ReflectionClass(Entity.Foo).getConstructor(), metadata.target);
    }

    testShouldLoadDecoratorsMetadata() {
        const manager = new ConnectionManager({
            default: {
                driver: 'sqlite',
                database: ':memory:',
                mappings: [
                    'Jymfony.Bundle.TypeORMBundle.Fixtures.Entity.FooDecorated',
                    'Jymfony.Bundle.TypeORMBundle.Fixtures.Entity.RelatedDecorated',
                    'Jymfony.Bundle.TypeORMBundle.Fixtures.Entity.Embedded',
                    'Jymfony.Bundle.TypeORMBundle.Fixtures.Entity.LazyRelated',
                ],
            },
        }, 'default');

        const connection = manager.get();
        const metadata = connection.findMetadata(Entity.FooDecorated);

        __self.assertNotNull(metadata);
        __self.assertEquals(new ReflectionClass(Entity.FooDecorated).getConstructor(), metadata.target);
        __self.assertEquals([
            'id _id',
            'name _name',
            'related_id _related',
            'lazy_related_id _lazyRelated',
            'embeds_external_id _externalId',
            'embeds_updated_at _updatedAt',
        ], metadata.columns.map(m => m.databaseName + ' ' + m.propertyName));
        __self.assertEquals([
            '_related',
            '_lazyRelated',
        ], metadata.relations.map(m => m.propertyName));
    }
}
