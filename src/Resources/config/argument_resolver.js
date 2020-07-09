/** @global {Jymfony.Component.DependencyInjection.ContainerBuilder} container */

const Reference = Jymfony.Component.DependencyInjection.Reference;

container.register(Jymfony.Bundle.TypeORMBundle.Controller.EntityArgumentResolver)
    .addTag('controller.argument_value_resolver', { priority: 20 })
    .addArgument(new Reference('typeorm'))
;
