const Connection = Jymfony.Bundle.TypeORMBundle.Connection.Connection;
const EntityManager = Jymfony.Bundle.TypeORMBundle.EntityManager;
const RepositoryNotFoundError = Jymfony.Bundle.TypeORMBundle.Exception.RepositoryNotFoundError;
const RepositoryFactory = Jymfony.Bundle.TypeORMBundle.Repository.RepositoryFactory;
const Argument = Jymfony.Component.Testing.Argument.Argument;
const Prophet = Jymfony.Component.Testing.Prophet;
const Foo = Jymfony.Bundle.TypeORMBundle.Fixtures.Entity.Foo;
const FooRepository = Jymfony.Bundle.TypeORMBundle.Fixtures.Repository.FooRepository;

const expect = require('chai').expect;

describe('EntityManager', function () {
    beforeEach(() => {
        this._prophet = new Prophet();
        this._connection = this._prophet.prophesize(Connection);
    });

    afterEach(() => {
        this._prophet.checkPredictions();
    });

    it('could be created', () => {
        new EntityManager(this._connection.reveal());
    });

    it('getRepository should throw if requested for a non-entity object', () => {
        const em = new EntityManager(this._connection.reveal());
        this._connection.hasMetadata(Argument.any()).willReturn(false);

        expect(() => {
            em.getRepository(Foo);
        }).to.throw(RepositoryNotFoundError);
    });

    it('getRepository should return the custom repository', () => {
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

        const repository = em.getRepository(Foo);

        expect(repository).to.be.instanceOf(FooRepository);
    });
});
