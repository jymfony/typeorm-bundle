require('@jymfony/autoloader');

Jymfony.Component.Debug.Debug.enable();

const Runner = Jymfony.Component.Testing.Framework.Runner;

Jymfony.Bundle.TypeORMBundle.Utils.FindOptionsUtils.patch();
Jymfony.Bundle.TypeORMBundle.Transformer.RawSqlResultsToEntityTransformer.patch();

new Runner().run([ 'test/**/*Test.js' ]);
