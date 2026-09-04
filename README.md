# FreshLedger

FreshLedger is a full-stack web-based business management system developed for Fresh Food Enterprises. The system is designed to manage daily business operations such as customers, suppliers, products, purchases, sales, payments, and pending amounts in a centralized and organized manner.

## Project Overview

FreshLedger provides a simple and efficient platform for managing fresh food business activities. It reduces manual record-keeping and helps maintain accurate transaction and business information.

The system consists of a React-based frontend, a Node.js and Express.js backend, and MongoDB for database management.

## Main Features

* User registration and login
* Secure authentication
* Dashboard for business overview
* Customer management
* Supplier management
* Product and inventory management
* Purchase management
* Sales management
* Payment and pending amount tracking
* Transaction records
* Data validation
* Centralized database management
* Responsive and user-friendly interface

## Technology Stack

### Frontend

* React.js
* HTML5
* CSS3
* JavaScript

### Backend

* Node.js
* Express.js
* REST API

### Database

* MongoDB
* Mongoose

### Other Technologies

* JWT Authentication
* CORS
* dotenv
* npm

## Project Structure

```text
FreshFood/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Customer.js
│   │   ├── Supplier.js
│   │   ├── Product.js
│   │   ├── Sale.js
│   │   └── Purchase.js
│   │
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── server.js
│   └── .env
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
└── README.md
```

## Prerequisites

Before running the project, make sure the following are installed:

* Node.js
* npm
* MongoDB
* MongoDB Shell (mongosh)
* A code editor such as Visual Studio Code

## Installation

### 1. Clone or download the project

Download the project and open the project folder in Visual Studio Code.

### 2. Install backend dependencies

Open a terminal and run:

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

Open another terminal and run:

```bash
cd frontend
npm install
```

## Environment Variables

Create a `.env` file inside the `backend` folder.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Replace the values with your actual configuration.

## Running the Project

### Start the Backend

From the `backend` folder:

```bash
npm start
```

The backend server will run on:

```text
http://localhost:5000
```

### Start the Frontend

Open another terminal and run:

```bash
cd frontend
npm start
```

The frontend will normally run on:

```text
http://localhost:3000
```

## Database

FreshLedger uses MongoDB to store application data.

The database contains information related to:

* Users
* Customers
* Suppliers
* Products
* Sales
* Purchases

MongoDB must be running before starting the backend if the application is configured to use a local MongoDB database.

## Business Logic

The system maintains accurate financial calculations for transactions.

For example:

```text
Pending Amount = Total Amount - Paid Amount
```

The system also validates required fields, numeric values, quantities, email formats, and other transaction-related information.

## Security

FreshLedger uses authentication and authorization mechanisms to protect user accounts and application data.

Security features include:

* JWT-based authentication
* Password protection
* Protected API routes
* Environment variables for sensitive configuration
* Input validation

## Purpose of the Project

The main purpose of FreshLedger is to provide Fresh Food Enterprises with a centralized digital solution for managing business operations and reducing dependency on manual records.

The system aims to improve:

* Data accuracy
* Business organization
* Transaction tracking
* Inventory management
* Customer and supplier management
* Financial record management
* Accessibility of business information

## Future Scope

Future versions of FreshLedger may include:

* Advanced sales and purchase reports
* Graphical business analytics
* Automated invoice generation
* PDF and Excel report export
* Email notifications
* Role-based access control
* Cloud deployment
* Mobile application support
* Automated backup and recovery

## Project Status

**Status:** Under Development

FreshLedger is being developed as a full-stack web application for Fresh Food Enterprises.

## License

This project is developed for academic and educational purposes.
