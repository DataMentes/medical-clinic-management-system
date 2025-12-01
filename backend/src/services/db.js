// This file handles the connection to the database.
const { Pool } = require('pg');

// a connection pool to handle multiple queries efficiently
const pool = new Pool({
    host: 'localhost',       // database host
    user: 'postgres',        // database user 
    password: 'password',    // database password
    database: 'clinic_db',   // database name
    port: 5432,              // Default PostgreSQL port
    max: 10,                 // Max number of clients in the pool
    idleTimeoutMillis: 30000
});

module.exports = pool;