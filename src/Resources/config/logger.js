/** @global {Jymfony.Component.DependencyInjection.ContainerBuilder} container */

const Reference = Jymfony.Component.DependencyInjection.Reference;

container.register(Jymfony.Bundle.TypeORMBundle.Logger.Logger)
    .addArgument(new Reference('logger'))
    .addTag('jymfony.logger', { channel: 'typeorm' })
;
