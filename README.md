FACTO - Stone Processing Management System
A comprehensive web application for managing stone processing operations, inventory, and procurement workflows.

1. Repository
Project Name: factoproject
GitHub URL: https://github.com/Arpittak/factoproject.git

To get started, clone the repository:

bash
git clone https://github.com/Arpittak/factoproject.git
cd factoproject


2. Overview
FACTO is a full-stack web application designed to streamline stone processing business operations. It provides modules for inventory management, procurement tracking, vendor management, and future order processing capabilities.

3. Technology Stack
Backend
Runtime: Node.js
Framework: Express.js
Database: MySQL 8.0
Authentication: JWT (ready for implementation)
API Architecture: RESTful APIs
Frontend
Framework: React.js
Build Tool: Vite
Styling: CSS3 with responsive design
State Management: React Hooks
HTTP Client: Axios
UI Components: Custom components with mobile-first design


4. System Requirements
Prerequisites
Node.js (v14+ recommended)
MySQL 8.0 Community Edition
MySQL Workbench 8.0 CE
npm package manager
Development Environment
Any modern code editor (VS Code recommended)
MySQL Workbench for database management
Modern web browser with developer tools



5. Installation & Setup


Step 1: Node.js Installation
Download Node.js https://nodejs.org/en/download
Run the installer → click Next → accept license → Install Node.js runtime & npm.
During installation, check the option:
"Automatically install necessary tools" (recommended).
After installation, add Node.js to System PATH (if not done automatically):
Go to System Properties → Advanced → Environment Variables → Path → Edit → Add Node.js installation path (usually C:\Program Files\nodejs).
Verify installation:
bash
   node -v
   npm -v
Video guide: Node.js Installation Tutorial


Step 2: MySQL Installation
Download MySQL Installer from the official site:
https://dev.mysql.com/downloads/installer/
Choose Custom Installation.
Select the latest versions of:
MySQL Server 8.0
MySQL Workbench 8.0
During setup:
Configure MySQL Root Password (remember/save it securely).
Keep default port 3306.
Complete installation.
Video guide: https://youtu.be/NzRDkNASxBQ?si=DRVdvNVGLrhobN4t


Step 3: Clone the Repository
bash
git clone https://github.com/Arpittak/factoproject.git
cd factoproject


Step 4: Database Setup
Note: To run code in MySQL Workbench: Click on MySQL root connection → Enter password → Terminal will open → Put code in terminal → Select the code → Click on the electricity/lightning bolt icon on top of the code.

Open MySQL Workbench and connect to the root connection.
Create a new database in the terminal:
sql:  CREATE DATABASE factodb;
sql2: Open the schema.sql file from the repository, copy all its code, and run it inside MySQL Workbench following the note above.

note again: if you got an error then run sql2


Step 5: Backend Setup
Navigate to the server directory:
bash
   cd server
   npm install
Create a .env file in the server/ directory: Note: Do not forget to put your password created at the time of installation of MySQL Workbench.
env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=factodb
   PORT=5000

Step 6: Frontend Setup
Navigate to the client directory:
bash
   cd client
   npm install


6. Running the Application
Start the Backend Server
Open a terminal, navigate to the server directory, and run:

bash
cd server
node app.js
Start the Frontend Development Server
Open a second terminal, navigate to the client directory, and run:

bash
cd client
npm run dev
Access Points
Frontend: http://localhost:5173
Backend API: http://localhost:5000
Database: localhost:3306/factodb



7. Features
Current Modules
Inventory Management: Track materials, manage quantities in pieces and sq meters, perform manual stock adjustments, and categorize inventory by stage.
Procurement Management: Create and manage procurement records, handle multi-vendor sourcing, manage GST, and track items.
Vendor Management: Maintain a comprehensive database of vendors with contact, business, and banking details.
Planned Modules
Order Processing
Production Management
Advanced Reporting


8. Project Structure
factoproject/
├── server/              # Backend application
│   ├── src/
│   │   ├── controllers/   # Business logic
│   │   ├── routes/        # API endpoints
│   │   └── config/        # Database configuration
│   ├── database/          # Schema and sample data
│   ├── app.js             # Express server setup
│   └── package.json
├── client/              # Frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Main page components
│   │   └── styles/        # CSS files
│   ├── public/            # Static assets
│   ├── vite.config.js     # Vite configuration
│   └── package.json
└── README.md


9. Database Schema
Core Tables
stones: Master stone types
vendors: Vendor information
procurements: Procurement records
procurement_items: Items within procurements
inventory_items: Unique inventory items
inventory_transactions: Log of all inventory movements
stages: Processing stages
edges_types: Edge finishing types
finishing_types: Surface finishing types
hsn_codes: HSN codes for tax
Key Relationships
Procurement → Procurement Items → Inventory Items
Inventory Items → Inventory Transactions (audit trail)
All items are linked to master data tables (stones, stages, vendors)


10. API Endpoints
Inventory Management
GET    /api/inventory              # Get all inventory items
POST   /api/inventory/manual-add   # Add inventory manually
POST   /api/inventory/manual-adjust# Adjust quantities
DELETE /api/inventory/:id          # Delete inventory item
GET    /api/inventory/analytics    # Get inventory statistics
Procurement Management
GET    /api/procurements           # Get all procurements
POST   /api/procurements           # Create new procurement
GET    /api/procurements/:id       # Get procurement details
POST   /api/procurements/:id/items # Add item to procurement
DELETE /api/procurements/items/:id# Delete procurement item
GET    /api/procurements/analytics # Get procurement statistics
Master Data
GET /api/master/stones            # Get all stone types
GET /api/master/stages            # Get processing stages
GET /api/master/edges             # Get edge types
GET /api/master/finishes          # Get finishing types
GET /api/master/hsn-codes         # Get HSN codes
GET /api/vendors                  # Get all vendors

11. Business Logic & Implementation
Business Logic
Quantity Management: All calculations are based on square meters (sq_meter) as the master unit. Piece counts are derived using Math.ceil(sq_meter / area_per_piece).
Inventory Transactions: Every change to inventory (add, remove, procurement) creates a transaction record, ensuring a complete audit trail.
Procurement-Inventory Integration: New procurements and item additions/deletions automatically update inventory levels. Financial amounts are frozen at the time of procurement creation.
Features Implementation
Responsive Design: A mobile-first approach ensures adaptive layouts for desktop, tablet, and mobile devices.
Real-time Calculations: Unit conversions and procurement totals are calculated live in the UI.
Data Validation: Both frontend forms and backend APIs include validation to ensure data integrity.

12. Troubleshooting
Common Issues
MySQL Connection Error:

Ensure the MySQL server is running
Double-check the database credentials in the server/.env file
Verify that the factodb database exists
Port Already in Use:

If backend port 5000 is in use, check for other running applications
Vite will automatically find the next available port if 5173 is taken
Schema Import Error:

Make sure you are using the correct database (USE factodb;)
Verify the schema.sql file path and user permissions
Module Not Found Errors:

Run npm install in both the server and client directories
CORS Issues:

The backend is pre-configured for CORS. Verify the frontend URL matches the settings if issues arise
Database Reset
To completely reset the database, run the following SQL commands:

sql
DROP DATABASE factodb;
CREATE DATABASE factodb;
USE factodb;
-- Then re-run the schema.sql script


13. Contributing
Development Guidelines
Follow a component-based architecture
Maintain responsive design principles
Use consistent error handling and write clear, documented code
Thoroughly test all CRUD operations and ensure proper input validation
Git Workflow
bash
git checkout -b feature/your-feature-name
git add .
git commit -m "Add: your feature description"
git push origin feature/your-feature-name


14. License
This project is proprietary software developed for stone processing business operations.

For technical support or feature requests, please create an issue in the GitHub repository.

