/**
 * @file dbConnection.js
 * @description Handles database connection pooling using `mssql` for efficient database operations.
 */

const sql = require('mssql');
const dbConfig = require('./config/dbConfig');
let poolPromise;

/**
 * Establishes and manages a connection to the database using a connection pool.
 * If a connection pool already exists, it reuses the existing pool.
 *
 * @async
 * @function connectToDatabase
 * @returns {Promise<sql.ConnectionPool>} A promise that resolves to the active database connection pool.
 * @throws {Error} Throws an error if the database connection fails.
 *
 * @example
 * const { connectToDatabase } = require('./dbConnection');
 * async function queryDatabase() {
 *   try {
 *     const pool = await connectToDatabase();
 *     const result = await pool.request().query('SELECT * FROM SomeTable');
 *     console.log(result.recordset);
 *   } catch (err) {
 *     console.error('Database query failed:', err);
 *   }
 * }
 */
async function connectToDatabase() {
    if (!poolPromise) {
        poolPromise = sql.connect(dbConfig)
            .then(pool => {
                console.log('Connected to the database');
                return pool;
            })
            .catch(err => {
                console.error('Database connection failed:', err);
                poolPromise = null;
                throw err;
            });
    }
    return poolPromise;
}

module.exports = {
    connectToDatabase
};