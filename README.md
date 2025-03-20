# Employee Management System

A web-based employee management system with user authentication, admin panel, employee registration, QR code generation, and ID card generation.

## Features

- **User Authentication**:
  - Users have usernames consisting of the first four letters of their name followed by "@kirs"
  - Passwords are securely hashed using bcrypt
  - Different user roles: Super Admin, Admin, Assistant Admin, and regular users

- **Admin Panel**:
  - Super Admin can create and manage other admins and users
  - Admins can create and manage users
  - View and filter employees by registration date

- **Employee Management**:
  - Register new employees with their details
  - Edit employee information
  - Prevent duplicate registrations using PSN numbers as unique identifiers

- **QR Code Generation**:
  - Automatically generate QR codes for each employee
  - QR codes link to employee contact pages

- **ID Card Generation**:
  - Generate printable ID cards for employees
  - ID cards include employee details and QR codes

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd employee-management-system
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up the database:
   ```
   npm run setup-db
   ```
   This will create the database, tables, and a default Super Admin user.

4. Start the application:
   ```
   npm start
   ```
   The application will be available at http://localhost:3000

## Default Credentials

### Super Admin
- Username: superadmin@kirs
- Password: admin123

## Usage

1. **Login as Super Admin**:
   - Use the default Super Admin credentials to log in
   - Create additional admins and users as needed

2. **Login as User**:
   - Use the credentials provided by an admin
   - Register and manage employees
   - Generate ID cards and QR codes

3. **Employee Registration**:
   - Fill in the employee details form
   - Upload a profile picture (optional)
   - Submit the form to register the employee
   - View and download the generated QR code and ID card

4. **ID Card Generation**:
   - Navigate to an employee's details
   - Click on "View ID Card"
   - Print the ID card using the print button

## Development

To run the application in development mode with automatic restart on file changes:
```
npm run dev
```

## Database Structure

- **admins**: Stores admin user information
- **users**: Stores regular user information
- **employees**: Stores employee details, including QR codes and profile pictures

## License

This project is licensed under the MIT License.
