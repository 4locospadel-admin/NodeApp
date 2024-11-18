const sql = require('mssql');
const dbConfig = require('./config/dbConfig');

let poolPromise;

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