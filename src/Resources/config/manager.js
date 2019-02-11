/** @global {Jymfony.Component.DependencyInjection.ContainerBuilder} container */

const Alias = Jymfony.Component.DependencyInjection.Alias;

container.register(Jymfony.Bundle.TypeORMBundle.ManagerRegistry)
    .setPublic(true)
;

container.setAlias('typeorm', new Alias(Jymfony.Bundle.TypeORMBundle.ManagerRegistry, true));
