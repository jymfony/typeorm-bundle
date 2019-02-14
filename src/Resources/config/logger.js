/** @global {Jymfony.Component.DependencyInjection.ContainerBuilder} container */

const Reference = Jymfony.Component.DependencyInjection.Reference;
const Container = Jymfony.Component.DependencyInjection.ContainerInterface;

container.register(Jymfony.Bundle.TypeORMBundle.Logger.Logger)
    .addArgument(new Reference('logger', Container.NULL_ON_INVALID_REFERENCE))
    .addTag('jymfony.logger', { channel: 'typeorm' })
;
