const Command = Jymfony.Component.Console.Command.Command;
const InputOption = Jymfony.Component.Console.Input.InputOption;
const JymfonyStyle = Jymfony.Component.Console.Style.JymfonyStyle;

/**
 * @memberOf Jymfony.Bundle.TypeORMBundle.Console
 */
export default class SchemaSyncCommand extends Command {
    /**
     * Constructor.
     *
     * @param {Jymfony.Bundle.TypeORMBundle.ManagerRegistry} managerRegistry
     */
    __construct(managerRegistry) {
        super.__construct();

        /**
         * @type {Jymfony.Bundle.TypeORMBundle.ManagerRegistry}
         *
         * @private
         */
        this._managerRegistry = managerRegistry;
    }

    /**
     * @inheritdoc
     */
    static get defaultName() {
        return 'typeorm:schema:sync';
    }

    /**
     * @inheritdoc
     */
    configure() {
        this.description = 'Syncs schema to database';
        this.addOption('connection', 'c', InputOption.VALUE_REQUIRED, 'Connection used to sync the schema');
        this.addOption('dry-run', 'd', InputOption.VALUE_NONE, 'Do not execute the queries, just print them out');
        this.help = `The <info>%command.name%</info> command synchronizes the schema to the one generated from entities metadata:

    <info>%command.full_name%</info>

You can also optionally specify the name of a connection to sync the schema for:

    <info>%command.full_name% --connection=default</info>
`;
    }

    /**
     * @inheritdoc
     */
    async execute(input, output) {
        const io = new JymfonyStyle(input, output);
        io.title('TypeORM - Sync schema');

        const connectionName = input.getOption('connection');
        const connection = this._managerRegistry.getConnection(connectionName);

        if (! connection.isConnected) {
            await connection.connect();
        }

        const sqlInMemory = await connection.driver.createSchemaBuilder().log();
        if (0 === sqlInMemory.upQueries.length) {
            io.comment('<notice>Your schema is up to date</notice>');
        } else if (input.hasOption('dry-run')) {
            io.note('Schema synchronization will execute the following queries');
            io.writeln(sqlInMemory.upQueries.map(__jymfony.trim));
        } else {
            await connection.synchronize();
            io.success('Done');
        }
    }
}
