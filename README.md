# Letters Management System

A web-based system for managing railway board letters, with role-based access for GM (General Manager), SSM (Senior Section Manager), and regular users(Officers).

## Features

- **Letter Management**
  - Create and track letters
  - Reference number system
  - Status tracking (pending/closed)
  - Search and filter capabilities

- **User Management**
  - Role-based access control (GM, SSM, User)
  - Secure password management
  - User authentication with JWT

- **Real-time Updates**
  - Automatic refresh every 30 seconds
  - Live statistics and analytics

## Quick Start with GitHub Codespaces

The easiest way to run this project is using GitHub Codespaces:

1. Click the green "Code" button on the GitHub repository
2. Select "Create codespace on main"
3. Wait for the codespace to initialize (this may take a few minutes)
4. Once the codespace is ready, run these commands in the terminal:

   ```bash
   # Install MongoDB in codespace
   sudo apt-get update
   sudo apt-get install -y mongodb

   # Start MongoDB
   sudo service mongodb start

   # Setup and start the server
   cd server
   npm install
   echo "MONGODB_URI=mongodb://127.0.0.1:27017/lms_database
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=24h
   PORT=5000" > .env
   node src/scripts/createInitialUsers.js
   npm start &

   # In a new terminal, setup and start the client
   cd ../client
   npm install
   npm start
   ```

5. When prompted, click "Open in Browser" to view the application
6. Use the default credentials to log in:
   ```
   GM Account:
   Username: gm
   Password: gm123

   SSM Account:
   Username: ssm
   Password: ssm123
   ```

## Local Installation

If you prefer to run the project locally, follow these steps:

## Prerequisites

Before running this project, make sure you have the following installed:
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone [your-repo-url]
   cd LMS-Project
   ```

2. **Set Up MongoDB**
   - Install MongoDB from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - Start MongoDB service on your computer
   - The default MongoDB URL will be: `mongodb://127.0.0.1:27017/lms_database`

3. **Backend Setup**
   ```bash
   cd server
   npm install
   ```

   Create a `.env` file in the server directory with the following content:
   ```
   MONGODB_URI=mongodb://127.0.0.1:27017/lms_database
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=24h
   PORT=5000
   ```

4. **Frontend Setup**
   ```bash
   cd ../client
   npm install
   ```

5. **Start the Application**
   
   In the server directory:
   ```bash
   npm start
   ```

   In a new terminal, in the client directory:
   ```bash
   npm start
   ```

   The application will be available at `http://localhost:3000`

## Initial Setup

1. **Database Initialization**
   - The system needs an initial GM (General Manager) account
   - Run the following command in the server directory:
   ```bash
   node src/scripts/createInitialUsers.js
   ```

2. **Default Credentials**
   ```
   GM Account:
   Username: gm
   Password: gm123

   SSM Account:
   Username: ssm
   Password: ssm123
   ```

## Common Issues and Solutions

1. **MongoDB Connection Error**
   - Ensure MongoDB is installed and running
   - Check if the MongoDB URL in `.env` matches your setup (`mongodb://127.0.0.1:27017/lms_database`)
   - Verify MongoDB port is not blocked by firewall
   - Note: `127.0.0.1` and `localhost` are equivalent, but we recommend using `127.0.0.1` for consistency

2. **Port Conflicts**
   - If port 5000 is in use, change the PORT in server's `.env`
   - If port 3000 is in use, React will automatically suggest an alternative

3. **JWT Token Issues**
   - Ensure JWT_SECRET is set in `.env`
   - Clear browser storage if experiencing login issues

## Development Notes

- Frontend runs on port 3000
- Backend API runs on port 5000
- MongoDB runs on default port 27017
- API endpoints are prefixed with `/api`

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
