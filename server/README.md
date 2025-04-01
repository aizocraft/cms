Here's a comprehensive README.md for your Construction Management System backend that covers all aspects of your project:

# Construction Management System (CMS) - Backend API

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![Express](https://img.shields.io/badge/Express-4.x-lightgrey)
![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green)

## Table of Contents
- [Features](#features)
- [System Architecture](#system-architecture)
- [API Documentation](#api-documentation)
  - [Authentication](#1-authentication)
  - [Worker Management](#2-worker-management)
  - [Attendance Tracking](#3-attendance-tracking)
  - [Hardware Inventory](#4-hardware-inventory)
- [Database Models](#database-models)
- [Validation Schemas](#validation-schemas)
- [Error Handling](#error-handling)
- [Security](#security)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [Deployment](#deployment)
- [License](#license)

## Features
- **Role-based Access Control** (Admin, Engineer, Finance)
- **JWT Authentication** with secure token handling
- **Worker Management** with daily wage tracking
- **Attendance System** with site-specific tracking
- **Inventory Management** with low-stock alerts
- **Data Validation** for all API endpoints
- **Error Handling** with operational vs programming errors
- **API Documentation** with example requests/responses

## System Architecture
```

│   .env
│   app.js
│   package-lock.json
│   package.json
│   server.js
│
├───config
│       config.js
│       db.js
│
├───controllers
│       attendanceController.js
│       authController.js
│       hardwareController.js
│       workerController.js
│
├───middleware
│       auth.js
│       errorHandler.js
│       notFound.js
│
├───models
│       Attendance.js
│       Hardware.js
│       User.js
│       Worker.js
│
├───routes
│       attendanceRoutes.js
│       authRoutes.js
│       hardwareRoutes.js
│       index.js
│       workerRoutes.js
│
├───utils
│       ApiError.js
│
└───validations
        authValidation.js
        hardwareValidation.js
        workerValidation.js

```

## API Documentation

### Base URL
`http://localhost:5000/api/v1`

---

### 1. Authentication

#### Register User
`POST /auth/register`

**Roles:** `admin`, `engineer`, `finance`

```json
{
  "username": "site_engineer",
  "email": "engineer@example.com",
  "password": "Secure@123",
  "role": "engineer"
}
```

#### Login User
`POST /auth/login`

```json
{
  "email": "engineer@example.com",
  "password": "Secure@123"
}
```

**Response:**
```json
{
  "token": "eyJhbGci...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "site_engineer",
    "email": "engineer@example.com",
    "role": "engineer"
  }
}
```

---

### 2. Worker Management

#### Register Worker (Engineer+)
`POST /workers`

```json
{
  "name": "John Mwangi",
  "contact": "+254712345678",
  "role": "Mason",
  "dailyWage": 1500
}
```

#### Get All Workers
`GET /workers`

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "John Mwangi",
      "contact": "+254712345678",
      "role": "Mason",
      "dailyWage": 1500,
      "registeredBy": {
        "username": "site_engineer",
        "email": "engineer@example.com"
      }
    }
  ]
}
```

---

### 3. Attendance Tracking

#### Mark Attendance (Engineer+)
`POST /attendance`

```json
{
  "workerId": "507f1f77bcf86cd799439012",
  "present": true,
  "site": "Nairobi Tower"
}
```

#### Get Attendance Records
`GET /attendance`

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "worker": {
        "name": "John Mwangi",
        "role": "Mason"
      },
      "present": true,
      "site": "Nairobi Tower",
      "markedBy": {
        "username": "site_engineer"
      },
      "date": "2023-05-15T08:00:00.000Z"
    }
  ]
}
```

---

### 4. Hardware Inventory

#### Add Hardware Item (Engineer+)
`POST /hardware`

```json
{
  "name": "Portland Cement",
  "category": "Construction",
  "quantity": 100,
  "unit": "bags",
  "pricePerUnit": 850,
  "supplier": "Bamburi Cement",
  "threshold": 20
}
```

#### Get All Hardware Items
`GET /hardware`

**Features:**
- Auto low-stock detection
- Unit conversion (kg ↔ tonnes)
- Supplier information

---

## Database Models

### User
| Field     | Type     | Description                |
|-----------|----------|----------------------------|
| username  | String   | Unique, 3-30 chars         |
| email     | String   | Valid email format         |
| password  | String   | Hashed, min 6 chars        |
| role      | String   | admin/engineer/finance     |

### Worker
| Field      | Type     | Description                |
|------------|----------|----------------------------|
| name       | String   | Max 50 chars               |
| contact    | String   | Unique mobile number       |
| role       | String   | Job position               |
| dailyWage  | Number   | Positive value             |

### Attendance
| Field     | Type     | Description                |
|-----------|----------|----------------------------|
| worker    | ObjectId | Reference to Worker        |
| present   | Boolean  | Default: true              |
| site      | String   | Location name              |
| markedBy  | ObjectId | Reference to User          |

### Hardware
| Field         | Type     | Description                |
|---------------|----------|----------------------------|
| name          | String   | Unique, 3-100 chars        |
| category      | String   | 6 predefined categories    |
| quantity      | Number   | Non-negative               |
| unit          | String   | 7 supported units          |
| threshold     | Number   | Low-stock level            |

## Validation Schemas

### Auth Validation
- Username: 3-30 chars
- Email: valid format
- Password: min 6 chars
- Role: enum check

### Worker Validation
- Name: required, max 50 chars
- Contact: valid mobile number
- Daily wage: positive number

### Hardware Validation
- Name: 3-100 chars
- Quantity: ≥0
- Unit: enum check
- Price: ≥0

## Error Handling

**Error Response Format:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Invalid email",
      "param": "email",
      "location": "body"
    }
  ]
}
```

**Status Codes:**
- 400: Bad Request (Validation errors)
- 401: Unauthorized
- 404: Not Found
- 409: Conflict (Duplicate)
- 500: Server Error

## Security

- **Password Hashing**: bcryptjs with salt rounds
- **JWT**: 24h expiration, HTTP-only recommended
- **Input Sanitization**: express-validator
- **Role-based Access**: Middleware protection

## Installation

```bash
# Clone repository

# Move to server
cd server
# Install dependencies
npm install

# Start development server
npm run server

# Production start
npm start
```

## Environment Variables

`.env` file required:

```ini
MONGO_URI=mongodb://localhost:27017/cms_db
JWT_SECRET=complex_secret_here
PORT=5000
NODE_ENV=development
```

## Testing

```bash
# Run tests (setup needed)
npm test
```

## Deployment

1. Configure production database
2. Set `NODE_ENV=production`
3. Use process manager (PM2 recommended)
4. Configure HTTPS
5. Set up logging/monitoring

## License

MIT License - Free for commercial and personal use.