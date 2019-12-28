const ConnectionManager = Jymfony.Bundle.TypeORMBundle.Connection.ConnectionManager;
const EntityArgumentResolver = Jymfony.Bundle.TypeORMBundle.Controller.EntityArgumentResolver;
const EntityManager = Jymfony.Bundle.TypeORMBundle.EntityManager;
const Entity = Jymfony.Bundle.TypeORMBundle.Fixtures.Entity;
const ManagerRegistry = Jymfony.Bundle.TypeORMBundle.ManagerRegistry;
const Request = Jymfony.Component.HttpFoundation.Request;
const ControllerArgumentMetadata = Jymfony.Component.HttpServer.Controller.Metadata.ControllerArgumentMetadata;
const { expect } = require('chai');

describe('EntityArgumentResolver', function () {
    it ('should support registered entities', __jymfony.Platform.hasPublicFieldSupport() ? () => {
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

        const registry = new ManagerRegistry(manager);
        const resolver = new EntityArgumentResolver(registry);

        const request = Request.create('/');
        request.attributes.set('id', '125');

        const method = new ReflectionMethod(new ReflectionClass(Jymfony.Bundle.TypeORMBundle.Fixtures.Controller.Controller), 'showAction');
        const argument = new ControllerArgumentMetadata(method.parameters[0]);

        expect(resolver.supports(request, argument)).to.be.equal(true);
    } : undefined);

    it ('should yield entity', __jymfony.Platform.hasPublicFieldSupport() ? async () => {
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

        const connection = await manager.get().connect();
        await connection.driver.createSchemaBuilder().build();

        const entityManager = new EntityManager(connection);

        const entity = new Entity.FooDecorated();
        entity._id = 125;
        entity._embeds = new Entity.Embedded();
        entity._embeds._externalId = 'foo_id';

        await entityManager.save(entity);

        const registry = new ManagerRegistry(manager);
        const resolver = new EntityArgumentResolver(registry);

        const request = Request.create('/');
        request.attributes.set('id', '125');

        const method = new ReflectionMethod(new ReflectionClass(Jymfony.Bundle.TypeORMBundle.Fixtures.Controller.Controller), 'showAction');
        const argument = new ControllerArgumentMetadata(method.parameters[0]);

        const args = [];
        await __jymfony.forAwait(resolver.resolve(request, argument), value => {
            args.push(value);
        });

        expect(args).to.have.length(1);
    } : undefined);

    it ('should throw not found exception on non-existent entity', __jymfony.Platform.hasPublicFieldSupport() ? async () => {
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

        const connection = await manager.get().connect();
        await connection.driver.createSchemaBuilder().build();

        const registry = new ManagerRegistry(manager);
        const resolver = new EntityArgumentResolver(registry);

        const request = Request.create('/');
        request.attributes.set('id', '125');

        const method = new ReflectionMethod(new ReflectionClass(Jymfony.Bundle.TypeORMBundle.Fixtures.Controller.Controller), 'showAction');
        const argument = new ControllerArgumentMetadata(method.parameters[0]);

        try {
            await __jymfony.forAwait(resolver.resolve(request, argument), () => {});
            throw new Error('FAIL');
        } catch (e) {
            expect(e).to.be.instanceOf(Jymfony.Component.HttpFoundation.Exception.NotFoundHttpException);
        }
    } : undefined);
});
