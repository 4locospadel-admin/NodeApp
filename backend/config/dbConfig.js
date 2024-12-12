/**
 * @file dbConfig.js
 * @description Configuration file for database connection using environment variables.
 */

require('dotenv').config({ override: true });

/**
 * @typedef {Object} DBOptions
 * @property {boolean} encrypt - Whether the connection should be encrypted.
 * @property {boolean} enableArithAbort - Whether to enable arithmetic abort for SQL queries.
 */

/**
 * @typedef {Object} DBPoolOptions
 * @property {number} max - The maximum number of connections in the pool.
 * @property {number} min - The minimum number of connections in the pool.
 * @property {number} idleTimeoutMillis - The time (in milliseconds) a connection can be idle before being closed.
 */

/**
 * @typedef {Object} DBConfig
 * @property {string} user - The database username.
 * @property {string} password - The database password.
 * @property {string} server - The database server URL or IP address.
 * @property {string} database - The name of the database.
 * @property {DBOptions} options - Additional database connection options.
 * @property {DBPoolOptions} pool - Connection pooling options.
 */

/**
 * Database configuration object.
 * Environment variables are loaded from the `.env` file.
 *
 * @type {DBConfig}
 */
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true,
        enableArithAbort: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

module.exports = dbConfig;