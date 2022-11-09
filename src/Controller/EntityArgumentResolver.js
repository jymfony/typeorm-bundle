const ArgumentValueResolverInterface = Jymfony.Component.HttpServer.Controller.ArgumentValueResolverInterface;
const ResourceNotFoundException = Jymfony.Component.Routing.Exception.ResourceNotFoundException;

/**
 * @memberOf Jymfony.Bundle.TypeORMBundle.Controller
 */
export default class EntityArgumentResolver extends implementationOf(ArgumentValueResolverInterface) {
    /**
     * Constructor.
     *
     * @param {Jymfony.Bundle.TypeORMBundle.ManagerRegistry} managerRegistry
     */
    __construct(managerRegistry) {
        /**
         * @type {Jymfony.Bundle.TypeORMBundle.ManagerRegistry}
         *
         * @private
         */
        this._managerRegistry = managerRegistry;
    }

    /**
     * @inheritdoc
     */
    supports(request, argument) {
        if (! argument.type || null === this._managerRegistry.getMetadataFor(argument.type)) {
            return false;
        }

        return request.attributes.has('id') || request.attributes.has(argument.name);
    }

    /**
     * @inheritdoc
     */
    async * resolve(request, argument) {
        const entityManager = await this._managerRegistry.getManagerFor(argument.type);

        const identifier = request.attributes.get(argument.name, request.attributes.get('id'));
        const entity = await entityManager.findOneById(argument.type, identifier);

        if (! entity) {
            let representative = this._managerRegistry.getMetadataFor(argument.type).name;
            try {
                representative = new ReflectionClass(argument.type).name;
            } catch (e) {
                // Do nothing.
            }

            throw new ResourceNotFoundException(__jymfony.sprintf('%s object not found', representative));
        }

        yield entity;
    }
}
