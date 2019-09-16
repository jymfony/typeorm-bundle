/**
 * @memberOf Jymfony.Bundle.TypeORMBundle.Logger
 */
export default class Logger {
    /**
     * Constructor.
     *
     * @param {Jymfony.Component.Logger.LoggerInterface} logger
     */
    __construct(logger) {
        this._logger = logger;
    }

    /**
     * Logs query and parameters used in it.
     *
     * @param {string} query
     * @param {*[]} parameters
     * @param {QueryRunner} queryRunner
     */
    logQuery(query, parameters, queryRunner) { // eslint-disable-line no-unused-vars
        if (this._logger) {
            this._logger.debug('[SQL] ' + query, Object.filter({
                parameters,
            }, v => !! v));
        }
    }

    /**
     * Logs query that is failed.
     *
     * @param {string} error
     * @param {string} query
     * @param {string} parameters
     * @param {QueryRunner} queryRunner
     */
    logQueryError(error, query, parameters, queryRunner) { // eslint-disable-line no-unused-vars
        if (this._logger) {
            this._logger.error(error, Object.filter({
                parameters,
                query,
            }, v => !! v));
        }
    }

    /**
     * Logs query that is slow.
     *
     * @param {number} time
     * @param {string} query
     * @param {*[]} parameters
     * @param {QueryRunner} queryRunner
     */
    logQuerySlow(time, query, parameters, queryRunner) { // eslint-disable-line no-unused-vars
        if (this._logger) {
            this._logger.warning(__jymfony.sprintf('Slow query detected. Time: %s', time.toString()), Object.filter({
                time,
                query,
                parameters,
            }, v => !! v));
        }
    }

    /**
     * Logs events from the schema build process.
     *
     * @param {string} message
     * @param {QueryRunner} queryRunner
     */
    logSchemaBuild(message, queryRunner) { // eslint-disable-line no-unused-vars
        if (this._logger) {
            this._logger.debug('[Schema] ' + message);
        }
    }

    /**
     * Logs events from the migrations run process.
     *
     * @param {string} message
     * @param {QueryRunner} queryRunner
     */
    logMigration(message, queryRunner) { // eslint-disable-line no-unused-vars
        if (this._logger) {
            this._logger.debug('[Migration] ' + message);
        }
    }

    /**
     * Perform logging using given logger, or by default to the console.
     * Log has its own level and message.
     *
     * @param {string} level
     * @param {string} message
     * @param {QueryRunner} queryRunner
     */
    log(level, message, queryRunner) { // eslint-disable-line no-unused-vars
        if (! this._logger) {
            return;
        }

        let method = 'debug';
        switch (level) {
            case 'log':
                break;

            case 'info':
                method = 'info';
                break;

            case 'warn':
                method = 'warning';
                break;
        }

        this._logger[method](message);
    }
}
