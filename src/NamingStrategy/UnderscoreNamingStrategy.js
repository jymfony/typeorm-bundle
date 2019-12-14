import { Table } from 'typeorm/schema-builder/table/Table';

/**
 * @memberOf Jymfony.Bundle.TypeORMBundle.NamingStrategy
 * @implements NamingStrategyInterface
 */
export default class UnderscoreNamingStrategy {
    /**
     * Constructor.
     *
     * @param {int} Case
     */
    __construct(Case = __self.CASE_LOWER) {
        this._case = Case;
    }

    /**
     * Naming strategy name.
     */
    get name() {
        return 'underscore';
    }

    /**
     * Normalizes table name.
     *
     * @param {string} targetName Name of the target entity that can be used to generate a table name.
     * @param {string|undefined} userSpecifiedName For example if user specified a table name in a decorator, e.g. @Entity("name")
     *
     * @returns {string}
     */
    tableName(targetName, userSpecifiedName) {
        return userSpecifiedName || this._underscore(targetName);
    }

    /**
     * Creates a table name for a junction table of a closure table.
     *
     * @param originalClosureTableName Name of the closure table which owns this junction table.
     */
    closureJunctionTableName(originalClosureTableName) {
        return originalClosureTableName + '_closure';
    }

    /**
     * Gets the table's column name from the given property name.
     *
     * @param {string} propertyName
     * @param {string|undefined} customName
     * @param {string[]} embeddedPrefixes
     *
     * @returns {string}
     */
    columnName(propertyName, customName, embeddedPrefixes) {
        propertyName = '_' === propertyName[0] ? propertyName.substr(1) : propertyName;
        if (0 < embeddedPrefixes.length) {
            return this._underscore(embeddedPrefixes.map(p => '_' === p[0] ? p.substr(1) : p).join('_')) + '_' + (customName || this._underscore(propertyName));
        }

        return customName || this._underscore(propertyName);
    }

    /**
     * Gets the table's relation name from the given property name.
     *
     * @param {string} propertyName
     *
     * @returns {string}
     */
    relationName(propertyName) {
        propertyName = '_' === propertyName[0] ? propertyName.substr(1) : propertyName;
        return this._underscore(propertyName);
    }

    /**
     * Gets the table's primary key name from the given table name and column names.
     *
     * @param {Table|string} tableOrName
     * @param {string[]} columnNames
     *
     * @returns {string}
     */
    primaryKeyName(tableOrName, columnNames) {
        columnNames = [ tableOrName instanceof Table ? tableOrName.name : tableOrName, ...(columnNames.map(n => '_' === n[0] ? n.substr(1) : n)) ];

        return this._generateIdentifierName(columnNames, 'pk');
    }

    /**
     * Gets the table's unique constraint name from the given table name and column names.
     *
     * @param {Table|string} tableOrName
     * @param {string[]} columnNames
     *
     * @returns {string}
     */
    uniqueConstraintName(tableOrName, columnNames) {
        columnNames = [ tableOrName instanceof Table ? tableOrName.name : tableOrName, ...(columnNames.map(n => '_' === n[0] ? n.substr(1) : n)) ];

        return this._generateIdentifierName(columnNames, 'uniq');
    }

    /**
     * Gets the relation constraint (UNIQUE or UNIQUE INDEX) name from the given table name, column names
     * and WHERE condition, if UNIQUE INDEX used.
     *
     * @param {Table|string} tableOrName
     * @param {string[]} columnNames
     * @param {string} [where]
     *
     * @returns {string}
     */
    relationConstraintName(tableOrName, columnNames, where = undefined) {
        columnNames = [ tableOrName instanceof Table ? tableOrName.name : tableOrName, ...(columnNames.map(n => '_' === n[0] ? n.substr(1) : n)) ];
        if (where) {
            columnNames.push(where);
        }

        return this._generateIdentifierName(columnNames, 'rel');
    }

    /**
     * Gets the table's default constraint name from the given table name and column name.
     *
     * @param {Table|string} tableOrName
     * @param {string} columnName
     *
     * @returns {string}
     */
    defaultConstraintName(tableOrName, columnName) {
        const columnNames = [ tableOrName instanceof Table ? tableOrName.name : tableOrName, '_' === columnName[0] ? columnName.substr(1) : columnName ];

        return this._generateIdentifierName(columnNames, 'def');
    }

    /**
     * Gets the name of the foreign key.
     *
     * @param {Table|string} tableOrName
     * @param {string[]} columnNames
     *
     * @returns {string}
     */
    foreignKeyName(tableOrName, columnNames) {
        columnNames = [ tableOrName instanceof Table ? tableOrName.name : tableOrName, ...(columnNames.map(n => '_' === n[0] ? n.substr(1) : n)) ];

        return this._generateIdentifierName(columnNames, 'fk');
    }

    /**
     * Gets the name of the index - simple and compose index.
     *
     * @param {Table|string} tableOrName
     * @param {string[]} columns
     * @param {string} [where]
     *
     * @returns {string}
     */
    indexName(tableOrName, columns, where = undefined) {
        const columnNames = [ tableOrName instanceof Table ? tableOrName.name : tableOrName, ...(columns.map(n => '_' === n[0] ? n.substr(1) : n)) ];
        if (where) {
            columnNames.push(where);
        }

        return this._generateIdentifierName(columnNames, 'idx');
    }

    /**
     * Gets the name of the check constraint.
     *
     * @param {Table|string} tableOrName
     * @param {string} expression
     *
     * @returns {string}
     */
    checkConstraintName(tableOrName, expression) {
        const names = [ tableOrName instanceof Table ? tableOrName.name : tableOrName, expression ];

        return this._generateIdentifierName(names, 'chk');
    }

    /**
     * Gets the name of the exclusion constraint.
     *
     * @param {Table|string} tableOrName
     * @param {string} expression
     *
     * @returns {string}
     */
    exclusionConstraintName(tableOrName, expression) {
        const names = [ tableOrName instanceof Table ? tableOrName.name : tableOrName, expression ];

        return this._generateIdentifierName(names, 'xcl');
    }

    /**
     * Gets the name of the join column used in the one-to-one and many-to-one relations.
     *
     * @param {string} relationName
     * @param {string} referencedColumnName
     *
     * @returns {string}
     */
    joinColumnName(relationName, referencedColumnName) {
        return this._underscore(relationName) + '_' + this._underscore(referencedColumnName);
    }

    /**
     * Gets the name of the join table used in the many-to-many relations.
     *
     * @param {string} firstTableName
     * @param {string} secondTableName
     * @param {string} firstPropertyName
     * @param {string} secondPropertyName
     *
     * @returns {string}
     */
    joinTableName(firstTableName, secondTableName, firstPropertyName, secondPropertyName) { // eslint-disable-line no-unused-vars
        return this._underscore(firstTableName) + '_' + this._underscore(secondTableName);
    }

    /**
     * Columns in join tables can have duplicate names in case of self-referencing.
     * This method provide a resolution for such column names.
     *
     * @param {string} columnName
     * @param {int} index
     *
     * @returns {string}
     */
    joinTableColumnDuplicationPrefix(columnName, index) {
        return this._underscore(columnName) + '_' + index;
    }

    /**
     * Gets the name of the column used for columns in the junction tables.
     *
     * The reverse?:boolean parameter denotes if the joinTableColumnName is called for the junctionColumn (false)
     * or the inverseJunctionColumns (true)
     *
     * @param {string} tableName
     * @param {string} propertyName
     * @param {string} [columnName]
     *
     * @returns {string}
     */
    joinTableColumnName(tableName, propertyName, columnName = undefined) {
        return this._underscore(tableName) + '_' + this._underscore(columnName || propertyName);
    }

    /**
     * Gets the name of the column used for columns in the junction tables from the invers side of the relationship.
     *
     * @param {string} tableName
     * @param {string} propertyName
     * @param {string} [columnName]
     *
     * @returns {string}
     */
    joinTableInverseColumnName(tableName, propertyName, columnName = undefined) {
        return this.joinTableColumnName(tableName, propertyName, columnName);
    }

    /**
     * Adds globally set prefix to the table name.
     * This method is executed no matter if prefix was set or not.
     * Table name is either user's given table name, either name generated from entity target.
     * Note that table name comes here already normalized by #tableName method.
     *
     * @param {string} prefix
     * @param {string} tableName
     *
     * @returns {string}
     */
    prefixTableName(prefix, tableName) {
        return (prefix ? prefix + '_' : '') + tableName;
    }

    /**
     * Gets the name of the alias used for relation joins.
     *
     * @returns {string}
     */
    eagerJoinRelationAlias(alias, propertyPath) {
        return alias + '_' + propertyPath.replace('.', '_');
    }


    /**
     * Underscores a string.
     *
     * @param {string} string
     *
     * @returns {*}
     *
     * @private
     */
    _underscore(string) {
        string = '_' === string[0] ? string.substr(1) : string;
        string = string.replace(/(?:(?<=[a-z0-9])([A-Z])|(?<=[A-Z]{2})([a-z]))/g, (m, p1, p2) => {
            return '_' + (p1 || p2);
        });

        if (this._case === __self.CASE_UPPER) {
            return string.toUpperCase();
        }

        return string.toLowerCase();
    }

    /**
     * Generates an identifier from a list of column names obeying a certain string length.
     *
     * This is especially important for Oracle, since it does not allow identifiers larger than 30 chars,
     * however building idents automatically for foreign keys, composite keys or such can easily create
     * very long names.
     *
     * @param {string[]} columnNames
     * @param {string} prefix
     * @param {int} maxSize
     *
     * @returns {string}
     */
    _generateIdentifierName(columnNames, prefix = '', maxSize = 30) {
        const hash = columnNames.map(v => __jymfony.crc32(v).toString(16)).join('');

        return (prefix + '_' + hash).substr(0, maxSize).toUpperCase();
    }
}

UnderscoreNamingStrategy.CASE_LOWER = 0;
UnderscoreNamingStrategy.CASE_UPPER = 1;
