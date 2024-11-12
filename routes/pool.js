const mysql = require('mysql')
const fs = require('fs')

// var pool = mysql.createPool({
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     // password:'1234',
//     database: process.env.DB_NAME,
//     multipleStatements: true,
//     connectionlimit: 100

// })

const pool = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
    ssl: {
        ca: fs.readFileSync('ca.pem')
    }
})

pool.connect((err) => {
    if (err) {
        console.error('Connection failed: ', err.stack);
        return;
    }
    console.log('Connected to Aiven MySQL as id ' + connection.threadId);
});

module.exports = pool