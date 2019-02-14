const Command = Jymfony.Component.Console.Command.Command;
const InputOption = Jymfony.Component.Console.Input.InputOption;
const JymfonyStyle = Jymfony.Component.Console.Style.JymfonyStyle;

/**
 * @memberOf Jymfony.Bundle.TypeORMBundle.Console
 */
class DatabaseCreateCommand extends Command {
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
    configure() {
        this.name = 'typeorm:database:create';
        this.addOption('connection', 'c', InputOption.VALUE_REQUIRED, 'Connection for which the database should be created');
        this.addOption('if-not-exists', null, InputOption.VALUE_NONE, 'Do not throw error if database already exists');
        this.help = `The <info>%command.name%</info> command creates the default connections database:

    <info>%command.full_name%</info>

You can also optionally specify the name of a connection to create the database for:

    <info>%command.full_name% --connection=default</info>
`;
    }

    /**
     * @inheritdoc
     */
    async execute(input, output) {
        const io = new JymfonyStyle(input, output);
        io.title('TypeORM - Create database');

        const connectionName = input.getOption('connection');
        const connection = this._managerRegistry.getConnection(connectionName);

        if (! connection.isConnected) {
            await connection.connect();
        }

        const queryRunner = connection.createQueryRunner();
        await queryRunner.createDatabase(connection.options.database.toString(), input.hasOption('if-not-exists'));

        io.success('Done');
    }
}

module.exports = DatabaseCreateCommand;
