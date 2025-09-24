# FACTO - Stone Processing Management System

A comprehensive web application for managing stone processing operations, inventory, and procurement workflows.

## Repository

**Project Name**: factoproject  
**GitHub URL**: https://github.com/Arpittak/factoproject.git

```bash
git clone https://github.com/Arpittak/factoproject.git
cd factoproject
```

## Overview

FACTO is a full-stack web application designed to streamline stone processing business operations. It provides modules for inventory management, procurement tracking, vendor management, and future order processing capabilities.

## Features

### Current Modules

#### Inventory Management
- Track stone materials at different processing stages
- Real-time quantity management in both pieces and square meters
- Automatic unit conversion calculations
- Manual stock adjustments with transaction history
- Stage-based inventory categorization (Raw Materials → Packaging Complete)
- Comprehensive filtering and search capabilities

#### Procurement Management
- Create and manage stone procurement records
- Multi-vendor sourcing workflow
- GST handling (IGST, CGST, SGST)
- Item-level tracking with specifications
- Add/Remove items from existing procurements
- Automatic inventory updates on procurement changes
- Detailed procurement analytics and reporting

#### Vendor Management
- Comprehensive vendor database
- Contact information and business details
- GST number and banking information management

### Planned Modules
- Order Processing
- Production Management
- Advanced Reporting

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL 8.0
- **Authentication**: JWT (ready for implementation)
- **API Architecture**: RESTful APIs

### Frontend
- **Framework**: React.js
- **Build Tool**: Vite
- **Styling**: CSS3 with responsive design
- **State Management**: React Hooks
- **HTTP Client**: Axios
- **UI Components**: Custom components with mobile-first design

## System Requirements

### Prerequisites
- Node.js (v14+ recommended)
- MySQL 8.0 Community Edition
- MySQL Workbench 8.0 CE
- npm package manager

### Development Environment
- Any modern code editor (VS Code recommended)
- MySQL Workbench for database management
- Modern web browser with developer tools

## Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Arpittak/factoproject.git
cd factoproject
```

### 2. Database Setup

#### Step 1: Install MySQL 8.0 Community Edition
Download and install MySQL Server 8.0 and MySQL Workbench from the official website.

#### Step 2: Create Database
Open MySQL Workbench and create a new database:
```sql
CREATE DATABASE factodb;
```

#### Step 3: Connect to MySQL Server
Open Command Prompt and run:
```bash
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p
```
Enter your MySQL root password when prompted.

#### Step 4: Import Database Schema
Navigate to the project's database folder and run:
```bash
USE factodb;
source schema.sql;
```

### 3. Backend Setup
```bash
cd server
npm install

# Create .env file with your configuration
# Update with your database credentials:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=factodb
PORT=5000
```

### 4. Frontend Setup
```bash
cd client
npm install
```

## Running the Application

### Development Mode

#### Terminal 1 - Backend
```bash
cd server
node app.js
```

#### Terminal 2 - Frontend
```bash
cd client
npm run dev
```

### Access Points
- Frontend: http://localhost:5173 (Vite development server)
- Backend API: http://localhost:5000
- Database: localhost:3306/factodb

## Database Schema

### Core Tables
- **stones**: Master stone types and names
- **vendors**: Vendor information and business details
- **procurements**: Procurement records with GST details
- **procurement_items**: Individual items within procurements
- **inventory_items**: Unique stone specifications in inventory
- **inventory_transactions**: All inventory movements and changes
- **stages**: Processing stages (Raw Material, In Progress, Packaging Complete)
- **edges_types**: Edge finishing types
- **finishing_types**: Surface finishing types
- **hsn_codes**: HSN codes for tax purposes

### Key Relationships
- Procurement → Procurement Items → Inventory Items
- Inventory Items → Inventory Transactions (audit trail)
- All items linked to master data (stones, stages, vendors)

## API Endpoints

### Inventory Management
```
GET    /api/inventory              # Get all inventory items
POST   /api/inventory/manual-add   # Add inventory manually
POST   /api/inventory/manual-adjust # Adjust quantities
DELETE /api/inventory/:id          # Delete inventory item
GET    /api/inventory/analytics    # Get inventory statistics
```

### Procurement Management
```
GET    /api/procurements           # Get all procurements
POST   /api/procurements           # Create new procurement
GET    /api/procurements/:id       # Get procurement details
POST   /api/procurements/:id/items # Add item to procurement
DELETE /api/procurements/items/:id # Delete procurement item
GET    /api/procurements/analytics # Get procurement statistics
```

### Master Data
```
GET /api/master/stones    # Get all stone types
GET /api/master/stages    # Get processing stages
GET /api/master/edges     # Get edge types
GET /api/master/finishes  # Get finishing types
GET /api/master/hsn-codes # Get HSN codes
GET /api/vendors          # Get all vendors
```

## Business Logic

### Quantity Management
- **Master Unit**: Square meters (sq_meter) is the primary unit for all calculations
- **Conversion Logic**: Pieces calculated using: `Math.ceil(sq_meter / area_per_piece)`
- **"Sq Meter First" Approach**: All operations convert to sq_meter first, then recalculate pieces

### Inventory Transactions
- Every inventory change creates a transaction record
- Maintains running balances in both pieces and square meters
- Transaction types: procurement_initial_stock, manual_add, manual_remove, procurement_item_deleted
- Complete audit trail for all inventory movements

### Procurement-Inventory Integration
- New procurements automatically update inventory
- Adding items to existing procurements updates inventory
- Deleting procurement items reverses inventory impact
- If deletion reduces inventory to zero or below, entire inventory item is removed
- Financial amounts (GST, totals) remain frozen at procurement creation time

## Project Structure

```
factoproject/
├── server/                 # Backend application
│   ├── src/
│   │   ├── controllers/    # Business logic
│   │   ├── routes/        # API endpoints
│   │   └── config/        # Database configuration
│   ├── database/          # Schema and sample data
│   ├── app.js            # Express server setup
│   └── package.json
├── client/                # Frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Main page components
│   │   └── styles/       # CSS files
│   ├── public/           # Static assets
│   ├── vite.config.js    # Vite configuration
│   └── package.json
└── README.md
```

## Features Implementation

### Responsive Design
- Mobile-first approach with breakpoints at 768px and 480px
- Adaptive layouts for desktop, tablet, and mobile devices
- Touch-friendly interfaces for mobile users

### Real-time Calculations
- Automatic unit conversions between pieces and square meters
- Live total calculations in procurement forms
- Dynamic inventory balance updates

### Data Validation
- Frontend form validation with error messages
- Backend API validation for data integrity
- Prevented negative quantities and invalid dimensions

## Troubleshooting

### Common Issues

1. **MySQL Connection Error**
   - Verify MySQL server is running
   - Check database credentials in .env file
   - Ensure factodb database exists

2. **Port Already in Use**
   - Backend (5000): Check if another application is using port 5000
   - Frontend (5173): Vite will automatically find next available port

3. **Schema Import Error**
   - Ensure you're in the correct database: `USE factodb;`
   - Verify schema.sql file path is correct
   - Check MySQL user has proper permissions

4. **Module Not Found Errors**
   - Run `npm install` in both server and client directories
   - Clear node_modules and reinstall if needed

5. **CORS Issues**
   - Backend includes CORS configuration for frontend communication
   - Verify frontend URL matches CORS settings

### Database Reset
To reset the database:
```sql
DROP DATABASE factodb;
CREATE DATABASE factodb;
USE factodb;
source schema.sql;
```

## Contributing

### Development Guidelines
- Follow component-based architecture
- Maintain responsive design principles
- Use consistent error handling
- Write clear, documented code
- Test all CRUD operations thoroughly
- Ensure proper input validation

### Git Workflow
```bash
git checkout -b feature/your-feature-name
git add .
git commit -m "Add: your feature description"
git push origin feature/your-feature-name
```

## License

This project is proprietary software developed for stone processing business operations.

---

**FACTO Stone Processing Management System** - Streamlining stone processing operations with modern web technology.

For technical support or feature requests, please create an issue in the GitHub repository.