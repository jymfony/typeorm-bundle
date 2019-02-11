const FileLocator = Jymfony.Component.Config.FileLocator;
const GlobResource = Jymfony.Component.Config.Resource.GlobResource;
const InvalidConfigurationException = Jymfony.Component.Config.Definition.Exception.InvalidConfigurationException;
const Alias = Jymfony.Component.DependencyInjection.Alias;
const Extension = Jymfony.Component.DependencyInjection.Extension.Extension;
const JsFileLoader = Jymfony.Component.DependencyInjection.Loader.JsFileLoader;

const { ConnectionManager } = require('typeorm');
const url = require('url');

/**
 * @memberOf Jymfony.Bundle.FrameworkBundle.DependencyInjection
 */
class TypeORMExtension extends Extension {
    /**
     * @inheritdoc
     */
    load(configs, container) {
        const loader = new JsFileLoader(container, new FileLocator(__dirname + '/../Resources/config'));
        loader.load('logger.js');
        loader.load('connection.js');
        loader.load('manager.js');

        // Needed for container injection in TypeORM
        container.setAlias(ConnectionManager, new Alias(Jymfony.Bundle.TypeORMBundle.Connection.ConnectionManager, true));

        const configuration = this.getConfiguration(container);
        const config = this._processConfiguration(configuration, configs);

        this._processConnections(config.connections, container);
    }

    /**
     * Process connections configuration options.
     *
     * @param {Object.<string, *>} connections
     * @param {Jymfony.Component.DependencyInjection.ContainerBuilder} container
     *
     * @private
     */
    _processConnections(connections, container) {
        if (0 === Object.keys(connections).length) {
            throw new InvalidConfigurationException('No connection has been defined in TypeORM configuration');
        }

        const connectionMappings = {};
        for (const [name, connection] of __jymfony.getEntries(connections)) {
            if (connection.url) {
                const parsed = url.parse(connection.url);
                connection.driver = __jymfony.rtrim(parsed.protocol, ':');

                const auth = parsed.auth.match(/^([^:]+):((?:\\@|[^@])+)$/);
                if (null !== auth) {
                    [ , connection.user, connection.password ] = auth;
                }

                connection.database = __jymfony.ltrim(parsed.pathname, '/');
            }

            let mappings = [];
            for (const mapping of Object.values(connection.mappings)) {
                mappings = mappings.concat([ ...this._processNamespace(mapping.namespace, container) ]);
            }

            connection.mappings = mappings;
            connectionMappings[name] = connection;
        }

        container
            .getDefinition(Jymfony.Bundle.TypeORMBundle.Connection.ConnectionManager)
            .addArgument(connectionMappings)
        ;
    }

    /**
     * Finds all the entity classes.
     *
     * @param {string} namespaceName
     * @param {Jymfony.Component.DependencyInjection.ContainerBuilder} container
     *
     * @returns {string}
     *
     * @private
     */
    * _processNamespace(namespaceName, container) {
        const namespace = __self._getNamespaceObject(namespaceName);

        for (const baseDir of namespace.directories) {
            const prefixLen = baseDir.length + 1;
            const resource = new GlobResource(baseDir, '**/*.js');
            container.addResource(resource);

            for (const file of resource) {
                const className = namespaceName + '.' + file.substr(prefixLen).replace(/\//g, '.').replace(/\.js/g, '');
                yield className;
            }
        }
    }

    /**
     * Gets the namespace object for the given namespace.
     *
     * @param {string} namespace
     * @returns {Jymfony.Component.Autoloader.Namespace}
     *
     * @private
     */
    static _getNamespaceObject(namespace) {
        const recursiveGet = (parts) =>  {
            let start = global;
            let part;

            // Save autoload debug flag.
            const debug = __jymfony.autoload.debug;
            __jymfony.autoload.debug = false;

            try {
                parts = [ ...parts ].reverse();

                while ((part = parts.pop())) {
                    if (undefined === start) {
                        return undefined;
                    }

                    start = start[part];
                }

                return start;
            } finally {
                // Restore debug flag.
                __jymfony.autoload.debug = debug;
            }
        };

        const ns = recursiveGet(namespace.split('.'));
        if (undefined === ns || undefined === ns.__namespace || ! (ns.__namespace instanceof Jymfony.Component.Autoloader.Namespace)) {
            throw new InvalidConfigurationException('Namespace ' + namespace + ' is not valid');
        }

        return ns.__namespace;
    }
}

module.exports = TypeORMExtension;
