const mysql = require('mysql2');
const bcrypt = require('bcrypt');

// MySQL database connection configuration
const dbConfig = {
    host: process.env.DB_HOST || 'mysql-shamsu557.alwaysdata.net',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'shamsu557',
    password: process.env.DB_PASSWORD || '@Shamsu1440', // Store securely
    database: process.env.DB_NAME || 'shamsu557_mydatabase'
};

// Create MySQL connection
const connection = mysql.createConnection(dbConfig);

console.log('Connecting to MySQL server...');

connection.connect((err) => {
    if (err) {
        console.error('❌ Error connecting to MySQL server:', err.message);
        return;
    }
    console.log('✅ Connected to MySQL server');

    // Switch to the correct database
    connection.query('USE shamsu557_mydatabase', (err) => {
        if (err) {
            console.error('❌ Error switching to database:', err.message);
            connection.end();
            return;
        }
        console.log('✅ Using database "shamsu557_mydatabase"');

        // // Define table creation queries
        // const tableQueries = [
        //     `CREATE TABLE IF NOT EXISTS admins (
        //         id INT AUTO_INCREMENT PRIMARY KEY,
        //         username VARCHAR(50) NOT NULL UNIQUE,
        //         password VARCHAR(255) NOT NULL,
        //         role ENUM('Super Admin', 'Admin', 'Assistant Admin') NOT NULL
        //     )`,

        //     `CREATE TABLE IF NOT EXISTS users (
        //         id INT AUTO_INCREMENT PRIMARY KEY,
        //         username VARCHAR(50) NOT NULL UNIQUE,
        //         password VARCHAR(255) NOT NULL,
        //         created_by INT,
        //         FOREIGN KEY (created_by) REFERENCES admins(id)
        //     )`,

        //     `CREATE TABLE IF NOT EXISTS employees (
        //         id INT AUTO_INCREMENT PRIMARY KEY,
        //         first_name VARCHAR(100) NOT NULL,
        //         surname VARCHAR(100) NOT NULL,
        //         other_name VARCHAR(100),
        //         rank VARCHAR(100) NOT NULL,
        //         picture VARCHAR(255),
        //         psn_number VARCHAR(50) NOT NULL UNIQUE,
        //         qr_code VARCHAR(255),
        //         registered_by VARCHAR(50) NOT NULL,
        //         registration_date DATETIME DEFAULT CURRENT_TIMESTAMP
        //     )`
        // ];

        // // Function to execute each table creation query
        // function executeTableQueries(index = 0) {
        //     if (index >= tableQueries.length) {
        //         console.log('✅ All tables created or already exist');
        //         createSuperAdmin(); // Proceed to create Super Admin
        //         return;
        //     }

        //     connection.query(tableQueries[index], (err) => {
        //         if (err) {
        //             console.error(`❌ Error creating table ${index + 1}:`, err.message);
        //             connection.end();
        //             return;
        //         }

        //         console.log(`✅ Table ${index + 1} created`);
        //         executeTableQueries(index + 1); // Execute next query
        //     });
        // }

//         // Function to check and create default Super Admin
//         function createSuperAdmin() {
//             connection.query('SELECT * FROM admins WHERE role = "Super Admin"', (err, results) => {
//                 if (err) {
//                     console.error('❌ Error checking for Super Admin:', err.message);
//                     connection.end();
//                     return;
//                 }

//                 if (results.length === 0) {
//                     console.log('⚠️ Creating default Super Admin...');

//                     const defaultPassword = 'admin123';
//                     bcrypt.hash(defaultPassword, 10, (err, hash) => {
//                         if (err) {
//                             console.error('❌ Error hashing password:', err.message);
//                             connection.end();
//                             return;
//                         }

//                         connection.query(
//                             'INSERT INTO admins (username, password, role) VALUES (?, ?, ?)',
//                             ['superadmin@kirs', hash, 'Super Admin'],
//                             (err) => {
//                                 if (err) {
//                                     console.error('❌ Error creating Super Admin:', err.message);
//                                     connection.end();
//                                     return;
//                                 }

//                                 console.log('✅ Default Super Admin created');
//                                 console.log('Username: superadmin@kirs');
//                                 console.log('Password: admin123 (Change this immediately)');
//                                 console.log('Role: Super Admin');

//                                 console.log('\n✅ Database setup completed successfully!');
//                                 connection.end();
//                             }
//                         );
//                     });
//                 } else {
//                     console.log('✅ Super Admin already exists');
//                     console.log('\n✅ Database setup completed successfully!');
//                     connection.end();
//                 }
//             });
//         }

//         // Start executing table creation queries
//         executeTableQueries();
//    
// 
});
});