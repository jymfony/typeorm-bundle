const ConnectionManager = Jymfony.Bundle.TypeORMBundle.Connection.ConnectionManager;
const ControllerArgumentMetadata = Jymfony.Component.HttpServer.Controller.Metadata.ControllerArgumentMetadata;
const Entity = Jymfony.Bundle.TypeORMBundle.Fixtures.Entity;
const EntityArgumentResolver = Jymfony.Bundle.TypeORMBundle.Controller.EntityArgumentResolver;
const EntityManager = Jymfony.Bundle.TypeORMBundle.EntityManager;
const ManagerRegistry = Jymfony.Bundle.TypeORMBundle.ManagerRegistry;
const Request = Jymfony.Component.HttpFoundation.Request;
const TestCase = Jymfony.Component.Testing.Framework.TestCase;

export default class EntityArgumentResolverTest extends TestCase {
    testShouldSupportRegisteredEntities() {
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

        __self.assertTrue(resolver.supports(request, argument));
    }

    async testShouldYieldEntity() {
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

        __self.assertCount(1, args);
    }

    async testShouldThrowNotFoundExceptionOnNonExistentEntity() {
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

        this.expectException(Jymfony.Component.Routing.Exception.ResourceNotFoundException);
        await __jymfony.forAwait(resolver.resolve(request, argument), () => {});
    }
}
