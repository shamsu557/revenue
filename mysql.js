const mysql = require('mysql');

// MySQL database connection configuration
const dbConfig = {
    host: process.env.DB_HOST || '192.250.239.84',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'kirsdigi_shamsu557',
    password: process.env.DB_PASSWORD || '@Shamsu1440', // Ensure this is set as an environment variable
    database: process.env.DB_NAME || 'kirsdigi_database'            // Database name from environment
};

// Create MySQL connection
const db = mysql.createConnection(dbConfig);

// Connect to MySQL database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Export the database connection
module.exports = db;
