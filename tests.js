require('@jymfony/autoloader');

Jymfony.Component.Debug.Debug.enable();

/**
 * @namespace
 */
Jymfony.Bundle.TypeORMBundle.Fixtures = new Jymfony.Component.Autoloader.Namespace(__jymfony.autoload, 'Jymfony.Bundle.TypeORMBundle.Fixtures', [
    __dirname + '/fixtures',
]);

require('mocha/bin/_mocha');
