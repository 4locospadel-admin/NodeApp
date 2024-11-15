const sql = require('mssql');
const dbConfig = require('../config/dbConfig');

async function connectToDatabase() {
    try {
        const pool = await sql.connect(dbConfig);
        console.log('Connected to the database');
        return pool;
    } catch (err) {
        console.error('Database connection failed:', err);
        throw err;
    }
}

module.exports = {
    connectToDatabase
};