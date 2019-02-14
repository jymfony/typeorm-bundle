/** @global {Jymfony.Component.DependencyInjection.ContainerBuilder} container */

const Reference = Jymfony.Component.DependencyInjection.Reference;

container.register(Jymfony.Bundle.TypeORMBundle.Console.DatabaseCreateCommand)
    .addArgument(Jymfony.Bundle.TypeORMBundle.ManagerRegistry)
    .setPublic(true)
    .addTag('console.command')
;
