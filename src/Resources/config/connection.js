/** @global {Jymfony.Component.DependencyInjection.ContainerBuilder} container */

const Reference = Jymfony.Component.DependencyInjection.Reference;

container.register(Jymfony.Bundle.TypeORMBundle.Connection.ConnectionManager)
    .addMethodCall('setLogger', [ new Reference(Jymfony.Bundle.TypeORMBundle.Logger.Logger) ])
    .setPublic(true)
;
