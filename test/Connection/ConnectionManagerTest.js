const ConnectionManager = Jymfony.Bundle.TypeORMBundle.Connection.ConnectionManager;
const EntitySchema = Jymfony.Bundle.TypeORMBundle.Metadata.EntitySchema;
const Entity = Jymfony.Bundle.TypeORMBundle.Fixtures.Entity;

const { expect } = require('chai');

describe('ConnectionManager', function () {
    it('should load static metadata', () => {
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
        expect(metadata).to.be.not.equal(undefined);
        expect(metadata.target).to.be.equal(new ReflectionClass(Entity.Foo).getConstructor());
    });

    it('should load decorators metadata', __jymfony.Platform.hasPublicFieldSupport() ? () => {
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
        expect(metadata).to.be.not.equal(undefined);
        expect(metadata.target).to.be.equal(new ReflectionClass(Entity.FooDecorated).getConstructor());
        expect(metadata.columns.map(m => m.databaseName + ' ' + m.propertyName))
            .to.be.deep.equal([
                'id _id',
                'name _name',
                'lazy_related_id _lazyRelated',
                'embeds_external_id _externalId',
                'embeds_updated_at _updatedAt',
            ]);

        expect(metadata.relations.map(m => m.propertyName))
            .to.be.deep.equal([
                '_related',
                '_lazyRelated',
            ]);
    } : undefined);
});
