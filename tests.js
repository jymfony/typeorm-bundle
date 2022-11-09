require('@jymfony/autoloader');

Jymfony.Component.Debug.Debug.enable();

/**
 * @namespace
 */
Jymfony.Bundle.TypeORMBundle.Fixtures = new Jymfony.Component.Autoloader.Namespace(__jymfony.autoload, 'Jymfony.Bundle.TypeORMBundle.Fixtures', [
    __dirname + '/fixtures',
]);

Jymfony.Bundle.TypeORMBundle.Utils.FindOptionsUtils.patch();
Jymfony.Bundle.TypeORMBundle.Transformer.RawSqlResultsToEntityTransformer.patch();
require('mocha/bin/_mocha');
