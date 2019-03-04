/** @global {Jymfony.Component.DependencyInjection.ContainerBuilder} container */

const Alias = Jymfony.Component.DependencyInjection.Alias;
const Reference = Jymfony.Component.DependencyInjection.Reference;

container.register(Jymfony.Bundle.TypeORMBundle.ManagerRegistry)
    .setPublic(true)
    .addArgument(new Reference(Jymfony.Bundle.TypeORMBundle.Connection.ConnectionManager))
;

container.setAlias('typeorm', new Alias(Jymfony.Bundle.TypeORMBundle.ManagerRegistry, true));
