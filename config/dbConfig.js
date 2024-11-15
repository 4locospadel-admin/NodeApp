require('dotenv').config();

const dbConfig = {
    user: "michalfloch",
    password: "4LocosPadel",
    server: "4locospadel.database.windows.net",
    database: "4locospadel",
    options: {
        encrypt: true,
        enableArithAbort: true
    }
};

module.exports = dbConfig;