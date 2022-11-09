const Type = Jymfony.Component.Autoloader.Decorator.Type;
const JsonResponse = Jymfony.Component.HttpFoundation.JsonResponse;
const Entity = Jymfony.Bundle.TypeORMBundle.Fixtures.Entity;

/**
 * @memberOf Jymfony.Bundle.TypeORMBundle.Fixtures.Controller
 */
export default class Controller {
    showAction(@Type(Entity.FooDecorated) foo) {
        return new JsonResponse(foo._id);
    }
}
