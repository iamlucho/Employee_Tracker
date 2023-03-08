const mysql = require("mysql2");
require('dotenv').config();
console.log(process.env);

const mysqlConnection = mysql.createConnection(
  {
    host: 'localhost',
/*     dialect: 'mysql', */
    port: 3306,
    user: process.env.DB_USER,
    database: process.env.DB_NAME, 
    password: process.env.DB_PASSWORD 
  },
  console.log(`Connected to the employees_db database.`)
);

module.exports = mysqlConnection;