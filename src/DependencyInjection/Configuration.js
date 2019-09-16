/* eslint-disable indent */

const TreeBuilder = Jymfony.Component.Config.Definition.Builder.TreeBuilder;
const ConfigurationInterface = Jymfony.Component.Config.Definition.ConfigurationInterface;

/**
 * @memberOf Jymfony.Bundle.TypeORMBundle.DependencyInjection
 */
export default class Configuration extends implementationOf(ConfigurationInterface) {
    /**
     * @inheritdoc
     */
    get configTreeBuilder() {
        const treeBuilder = new TreeBuilder('typeorm');
        const rootNode = treeBuilder.rootNode;

        this._addConnections(rootNode);

        return treeBuilder;
    }

    /**
     * @param {Jymfony.Component.Config.Definition.Builder.ArrayNodeDefinition} rootNode
     *
     * @private
     */
    _addConnections(rootNode) {
        rootNode
            .beforeNormalization()
                .ifTrue(v => isObjectLiteral(v) && undefined === v.connections)
                .then(v => {
                    const others = Object.assign({}, v);
                    const connection = v;
                    for (const [ key, value ] of __jymfony.getEntries(v)) {
                        if (-1 !== [ 'url', 'database', 'host', 'port', 'user', 'password', 'options', 'path', 'logging', 'migrations', 'mappings' ].indexOf(key)) {
                            connection[key] = value;
                            delete others[key];
                        }
                    }

                    return Object.assign({
                        default_connection: 'default',
                        connections: {
                            'default': connection,
                        },
                    }, others);
                })
            .end()
            .children()
                .scalarNode('default_connection').defaultValue('default').end()
                .arrayNode('connections')
                .arrayPrototype()
                    .children()
                        .scalarNode('url').end()
                        .scalarNode('driver').defaultValue('mysql').end()
                        .scalarNode('database').end()
                        .scalarNode('host').end()
                        .scalarNode('port').end()
                        .scalarNode('user').end()
                        .scalarNode('password').end()
                        .arrayNode('options').end()
                        .scalarNode('path').info('Path for SQLite database').end()
                        .booleanNode('logging').defaultValue('%kernel.debug%').end()
                        .arrayNode('migrations')
                            .arrayPrototype()
                                .children()
                                    .scalarNode('directory').defaultValue('%kernel.project_dir%/src/Migrations').end()
                                .end()
                            .end()
                        .end()
                        .arrayNode('mappings')
                            .useAttributeAsKey('name')
                            .arrayPrototype()
                                .beforeNormalization()
                                    .ifString()
                                    .then(v => {
                                        return { type: v };
                                    })
                                .end()
                                .treatNullLike({})
                                .treatFalseLike({ mappings: false })
                                .performNoDeepMerging()
                                .children()
                                    .scalarNode('mapping').defaultTrue().end()
                                    .enumNode('type').values([ 'static_js' ]).end()
                                    .scalarNode('namespace').end()
                                .end()
                            .end()
                        .end()
                    .end()
                    .validate()
                        .ifTrue(v => 0 === Object.keys(v.mappings).length)
                        .thenInvalid('At least one mapping is required for connection')
                    .end()
                .end()
            .end()
        ;
    }
}
