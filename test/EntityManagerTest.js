const Argument = Jymfony.Component.Testing.Argument.Argument;
const Connection = Jymfony.Bundle.TypeORMBundle.Connection.Connection;
const EntityManager = Jymfony.Bundle.TypeORMBundle.EntityManager;
const RepositoryNotFoundError = Jymfony.Bundle.TypeORMBundle.Exception.RepositoryNotFoundError;
const RepositoryFactory = Jymfony.Bundle.TypeORMBundle.Repository.RepositoryFactory;
const TestCase = Jymfony.Component.Testing.Framework.TestCase;

const Foo = Jymfony.Bundle.TypeORMBundle.Fixtures.Entity.Foo;
const FooRepository = Jymfony.Bundle.TypeORMBundle.Fixtures.Repository.FooRepository;

export default class EntityManagerTest extends TestCase {
    _connection;

    get defaultTimeout() {
        return 60000;
    }

    beforeEach() {
        this._connection = this.prophesize(Connection);
    }

    testCouldBeCreated() {
        new EntityManager(this._connection.reveal());
    }

    testGetRepositoryShouldThrowIfRequestedForANonEntityObject() {
        const em = new EntityManager(this._connection.reveal());
        this._connection.hasMetadata(Argument.any()).willReturn(false);

        this.expectException(RepositoryNotFoundError);
        em.getRepository(Foo);
    }

    testGetRepositoryShouldReturnTheCustomRepository() {
        const em = new EntityManager(this._connection.reveal());
        this._connection.driver = new class {}();

        em._repositoryFactory = new RepositoryFactory({
            entityRepositories: [
                {
                    entity: Foo,
                    target: FooRepository,
                },
            ],
        });

        this._connection.hasMetadata(Foo).willReturn(true);
        this._connection.getMetadata(Foo).willReturn({
            target: Foo,
        });

        __self.assertInstanceOf(FooRepository, em.getRepository(Foo));
    }
}
