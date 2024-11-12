const mysql = require('mysql')

var pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    // password:'1234',
    database: process.env.DB_NAME,
    multipleStatements: true,
    connectionlimit: 100

})

module.exports = pool