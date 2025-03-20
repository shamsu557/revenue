const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const qrcode = require('qrcode');
const fs = require('fs');
const util = require('util');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname));
app.use(session({
  secret: 'kirs-employee-management-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 3600000 } // 1 hour
}));

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'mysql-shamsu557.alwaysdata.net',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'shamsu557',
    password: process.env.DB_PASSWORD || '@Shamsu1440', // Ensure this is set as an environment variable
    database: process.env.DB_NAME || 'shamsu557_mydatabase'            // Database name from environment
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to MySQL database');
  
//   // Create tables if they don't exist
//   const createTablesQuery = `
//     CREATE TABLE IF NOT EXISTS admins (
//       id INT AUTO_INCREMENT PRIMARY KEY,
//       username VARCHAR(50) NOT NULL UNIQUE,
//       password VARCHAR(255) NOT NULL,
//       role ENUM('Super Admin', 'Admin', 'Assistant Admin') NOT NULL
//     );
    
//     CREATE TABLE IF NOT EXISTS users (
//       id INT AUTO_INCREMENT PRIMARY KEY,
//       username VARCHAR(50) NOT NULL UNIQUE,
//       password VARCHAR(255) NOT NULL,
//       created_by INT,
//       FOREIGN KEY (created_by) REFERENCES admins(id)
//     );
    
//     CREATE TABLE IF NOT EXISTS employees (
//       id INT AUTO_INCREMENT PRIMARY KEY,
//       first_name VARCHAR(100) NOT NULL,
//       surname VARCHAR(100) NOT NULL,
//       other_name VARCHAR(100),
//       rank VARCHAR(100) NOT NULL,
//       picture VARCHAR(255),
//       psn_number VARCHAR(50) NOT NULL,
//       qr_code VARCHAR(255),
//       registered_by VARCHAR(50) NOT NULL,
//       registration_date DATETIME DEFAULT CURRENT_TIMESTAMP
//     );
//   `;
  
//   db.query(createTablesQuery, (err, result) => {
//     if (err) {
//       console.error('Error creating tables:', err);
//       return;
//     }
//     console.log('Database tables created or already exist');
    
//     // Check if Super Admin exists, if not create one
//     db.query('SELECT * FROM admins WHERE role = "Super Admin"', (err, results) => {
//       if (err) {
//         console.error('Error checking for Super Admin:', err);
//         return;
//       }
      
//       if (results.length === 0) {
//         // Create default Super Admin
//         const defaultPassword = 'admin123';
//         bcrypt.hash(defaultPassword, 10, (err, hash) => {
//           if (err) {
//             console.error('Error hashing password:', err);
//             return;
//           }
          
//           const superAdmin = {
//             username: 'superadmin@kirs',
//             password: hash,
//             role: 'Super Admin'
//           };
          
//           db.query('INSERT INTO admins SET ?', superAdmin, (err, result) => {
//             if (err) {
//               console.error('Error creating Super Admin:', err);
//               return;
//             }
//             console.log('Default Super Admin created');
//           });
//         });
//       }
//     });
//   });
});
// Convert db.query to a promise-based function
const query = util.promisify(db.query).bind(db);

async function ensureSuperAdmin() {
  try {
    // Check if Super Admin exists
    const results = await query('SELECT * FROM admins WHERE role = ?', ['Super Admin']);

    if (results.length === 0) {
      // Create default Super Admin
      const defaultPassword = 'admin123';
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      const superAdmin = {
        username: 'superadmin@kirs',
        password: hashedPassword,
        role: 'Super Admin',
      };

      // Insert Super Admin
      await query('INSERT INTO admins SET ?', superAdmin);
      console.log('Default Super Admin created successfully');
    }
  } catch (err) {
    console.error('Error ensuring Super Admin:', err);
  }
}

// Call the function
ensureSuperAdmin();
// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  res.redirect('/login.html');
};

const isAdmin = (req, res, next) => {
  if (req.session.admin) {
    return next();
  }
  res.redirect('/admin-login.html');
};

// Routes

// User login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
    if (err) {
      console.error('Error during login:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    const user = results[0];
    
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Error comparing passwords:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }
      
      req.session.user = {
        id: user.id,
        username: user.username
      };
      
      res.json({ success: true });
    });
  });
});

// Admin login
app.post('/admin-login', (req, res) => {
  const { username, password } = req.body;
  
  db.query('SELECT * FROM admins WHERE username = ?', [username], (err, results) => {
    if (err) {
      console.error('Error during admin login:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    const admin = results[0];
    
    bcrypt.compare(password, admin.password, (err, isMatch) => {
      if (err) {
        console.error('Error comparing passwords:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }
      
      req.session.admin = {
        id: admin.id,
        username: admin.username,
        role: admin.role
      };
      
      res.json({ success: true });
    });
  });
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login.html');
});

// Admin logout
app.get('/admin-logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin-login.html');
});

// Create user (by admin)
app.post('/api/users', isAdmin, (req, res) => {
  const { name, password } = req.body;
  
  if (!name || !password) {
    return res.status(400).json({ error: 'Name and password are required' });
  }
  
  // Create username (first 4 letters of name + @kirs)
  const username = name.substring(0, 4).toLowerCase() + '@kirs';
  
  // Hash password
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.error('Error hashing password:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    const user = {
      username,
      password: hash,
      created_by: req.session.admin.id
    };
    
    db.query('INSERT INTO users SET ?', user, (err, result) => {
      if (err) {
        console.error('Error creating user:', err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ error: 'Username already exists' });
        }
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      res.status(201).json({ id: result.insertId, username });
    });
  });
});

// Delete user (by admin)
app.delete('/api/users/:id', isAdmin, (req, res) => {
  const userId = req.params.id;
  
  db.query('DELETE FROM users WHERE id = ?', [userId], (err, result) => {
    if (err) {
      console.error('Error deleting user:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ success: true });
  });
});
// Delete admin
app.delete('/api/admins/:id', isAdmin, async (req, res) => {
  if (req.session.admin.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Only Super Admin can delete admins' });
  }

  const adminId = req.params.id;

  try {
    // Check if target admin is Super Admin
    const [admin] = await db.promise().query('SELECT role FROM admins WHERE id = ?', [adminId]);
    
    if (admin[0]?.role === 'Super Admin') {
      return res.status(403).json({ error: 'Cannot delete Super Admin' });
    }

    const [result] = await db.promise().query('DELETE FROM admins WHERE id = ?', [adminId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting admin:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users (for admin)
app.get('/api/users', isAdmin, (req, res) => {
  db.query('SELECT id, username FROM users', (err, results) => {
    if (err) {
      console.error('Error getting users:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    res.json(results);
  });
});

// Create admin (by Super Admin)
app.post('/api/admins', isAdmin, (req, res) => {
  // Check if current user is Super Admin
  if (req.session.admin.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Only Super Admin can create other admins' });
  }
  
  const { username, password, role } = req.body;
  
  if (!username || !password || !role) {
    return res.status(400).json({ error: 'Username, password, and role are required' });
  }
  
  // Hash password
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.error('Error hashing password:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    const admin = {
      username,
      password: hash,
      role
    };
    
    db.query('INSERT INTO admins SET ?', admin, (err, result) => {
      if (err) {
        console.error('Error creating admin:', err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ error: 'Username already exists' });
        }
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      res.status(201).json({ id: result.insertId, username, role });
    });
  });
});

// Get all admins (for Super Admin)
app.get('/api/admins', isAdmin, (req, res) => {
  // Check if current user is Super Admin
  if (req.session.admin.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Only Super Admin can view all admins' });
  }
  
  db.query('SELECT id, username, role FROM admins', (err, results) => {
    if (err) {
      console.error('Error getting admins:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    res.json(results);
  });
});

// Register employee
app.post('/api/employees', isAuthenticated, (req, res) => {
  const { firstName, surname, otherName, rank, psnNumber, phoneNumber } = req.body;
  let picture = req.body.picture || '';
  
  if (!firstName || !surname || !rank || !psnNumber || !phoneNumber) {
    return res.status(400).json({ error: 'First name, surname, rank, PSN number, and phone number are required' });
  }
  
  // Check if employee with this phone number already exists
  db.query('SELECT * FROM employees WHERE phone_number = ?', [phoneNumber], (err, results) => {
    if (err) {
      console.error('Error checking for existing employee by phone:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    if (results.length > 0) {
      return res.status(409).json({ error: 'An employee with this phone number already exists' });
    }
    
    // Check if employee with this PSN number already exists
    db.query('SELECT * FROM employees WHERE psn_number = ?', [psnNumber], (err, results) => {
      if (err) {
        console.error('Error checking for existing employee by PSN:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      if (results.length > 0) {
        return res.status(409).json({ error: 'An employee with this PSN number already exists' });
      }
      
      // Generate QR code for the employee
      const contactPageUrl = `${req.protocol}://${req.get('host')}/contact.html?id=${psnNumber}`;
      
      qrcode.toDataURL(contactPageUrl, (err, qrCodeDataUrl) => {
        if (err) {
          console.error('Error generating QR code:', err);
          return res.status(500).json({ error: 'Error generating QR code' });
        }
        
        const employee = {
          first_name: firstName,
          surname,
          other_name: otherName || null,
          rank,
          picture,
          psn_number: psnNumber,
          phone_number: phoneNumber,
          qr_code: qrCodeDataUrl,
          registered_by: req.session.user.username
        };
        
        db.query('INSERT INTO employees SET ?', employee, (err, result) => {
          if (err) {
            console.error('Error registering employee:', err);
            return res.status(500).json({ error: 'Internal server error' });
          }
          
          res.status(201).json({ 
            id: result.insertId,
            ...employee,
            qr_code: qrCodeDataUrl
          });
        });
      });
    });
  });
});

// Get all employees
app.get('/api/employees', isAdmin, (req, res) => {
    const { date } = req.query;
    
    let query = 'SELECT * FROM employees';
    let params = [];
    
    if (date) {
      query += ' WHERE DATE(registration_date) = ?';
      params.push(date);
    }
    
    db.query(query, params, (err, results) => {
      if (err) {
        console.error('Error getting employees:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json(results);
    });
  });
  
// Get employee by ID or PSN
app.get('/api/employees/:identifier', (req, res) => {
  const identifier = req.params.identifier;
  
  // Check if identifier is numeric (ID) or string (PSN)
  const isNumeric = /^\d+$/.test(identifier);
  
  let query = 'SELECT * FROM employees WHERE ';
  query += isNumeric ? 'id = ?' : 'psn_number = ?';
  
  db.query(query, [identifier], (err, results) => {
    if (err) {
      console.error('Error getting employee:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json(results[0]);
  });
});

// Update employee
app.put('/api/employees/:id', isAuthenticated, (req, res) => {
  const employeeId = req.params.id;
  const { firstName, surname, otherName, rank, psnNumber, phoneNumber, picture } = req.body;
  
  if (!firstName || !surname || !rank || !psnNumber || !phoneNumber) {
    return res.status(400).json({ error: 'First name, surname, rank, PSN number, and phone number are required' });
  }
  
  // Check if another employee has this phone number
  db.query('SELECT * FROM employees WHERE phone_number = ? AND id != ?', [phoneNumber, employeeId], (err, results) => {
    if (err) {
      console.error('Error checking for existing employee by phone:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    if (results.length > 0) {
      return res.status(409).json({ error: 'Another employee with this phone number already exists' });
    }
    
    // Check if another employee has this PSN number
    db.query('SELECT * FROM employees WHERE psn_number = ? AND id != ?', [psnNumber, employeeId], (err, results) => {
      if (err) {
        console.error('Error checking for existing employee by PSN:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      if (results.length > 0) {
        return res.status(409).json({ error: 'Another employee with this PSN number already exists' });
      }
      
      const employee = {
        first_name: firstName,
        surname,
        other_name: otherName || null,
        rank,
        psn_number: psnNumber,
        phone_number: phoneNumber
      };
      
      if (picture) {
        employee.picture = picture;
      }
      
      db.query('UPDATE employees SET ? WHERE id = ?', [employee, employeeId], (err, result) => {
        if (err) {
          console.error('Error updating employee:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Employee not found' });
        }
        
        res.json({ id: employeeId, ...employee });
      });
    });
  });
});

// Get session info
app.get('/api/session', (req, res) => {
  if (req.session.user) {
    return res.json({ user: req.session.user });
  }
  
  if (req.session.admin) {
    return res.json({ admin: req.session.admin });
  }
  
  res.status(401).json({ error: 'Not authenticated' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

//database
// CREATE TABLE IF NOT EXISTS admins (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     username VARCHAR(50) NOT NULL UNIQUE,
//     password VARCHAR(255) NOT NULL,
//     role ENUM('Super Admin', 'Admin', 'Assistant Admin') NOT NULL
// );

// CREATE TABLE IF NOT EXISTS users (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     username VARCHAR(50) NOT NULL UNIQUE,
//     password VARCHAR(255) NOT NULL,
//     created_by INT,
//     FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL
// );

// CREATE TABLE IF NOT EXISTS employees (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     first_name VARCHAR(100) NOT NULL,
//     surname VARCHAR(100) NOT NULL,
//     other_name VARCHAR(100) DEFAULT NULL,
//     rank VARCHAR(100) NOT NULL,
//     picture VARCHAR(255) DEFAULT NULL,
//     psn_number VARCHAR(50) NOT NULL UNIQUE,
//     phone_number VARCHAR(20) NOT NULL UNIQUE,
//     qr_code VARCHAR(255) DEFAULT NULL,
//     registered_by VARCHAR(50) NOT NULL,
//     registration_date DATETIME DEFAULT CURRENT_TIMESTAMP
// );
