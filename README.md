Facto - Inventory and Procurement Management Clone
This project is a full-stack web application that replicates the core features of the Inventory and Procurement modules from the Facto application. It is built with the MERN stack (MySQL, Express, React, Node.js).

Features
Inventory Management:

Add new stock items with detailed properties (dimensions, stage, finish, etc.).

Adjust stock quantities (add/remove) with reasons.

Complete transaction history (ledger) for every stock item.

Advanced filtering and pagination for the inventory list.

Dashboard analytics for key inventory metrics.

Procurement Management:

Create detailed procurement records linked to vendors.

Add multiple stone items to a single procurement.

Automatic inventory updates upon procurement creation.

GST and pricing calculations.

Advanced filtering and pagination for the procurement list.

Vendor Management:

Add and view a list of all suppliers.

Tech Stack
Frontend: React.js (with Vite)

Backend: Node.js, Express.js

Database: MySQL

API Testing: Hoppscotch / Postman

How to Run This Project
Prerequisites
Node.js installed

A local MySQL server running

1. Setup the Backend
# Navigate to the server directory
cd server

# Install dependencies
npm install

# Create a .env file in the /server directory with your MySQL credentials:
# DB_HOST=localhost
# DB_USER=your_mysql_user
# DB_PASSWORD=your_mysql_password
# DB_NAME=factodb

# Create the database schema.
# Open the MySQL command line client. For example:
# "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p
# 
# Then, run the following command to execute the schema file:
# source path/to/your/project/schema.sql

# Start the server
node app.js

The backend will be running on http://localhost:5000.

2. Setup the Frontend
# Navigate to the client directory from the root
cd client

# Install dependencies
npm install

# Start the client development server
npm run dev

The frontend will be running on http://localhost:5173.