
# 🏗️ CMS - Construction Management System

<div align="center">

[![MERN Stack](https://img.shields.io/badge/MERN-Full%20Stack-00d8ff?style=for-the-badge&logo=react&logoColor=white)](https://mern.io)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-brightgreen?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com)

</div>

## 🌟 Project Overview

A modern **Construction Management System** built with the MERN stack that revolutionizes construction site operations with real-time tracking and management capabilities.

<div align="center">
  <img src="https://img.shields.io/github/repo-size/yourusername/construction-management-system?style=flat-square&color=blueviolet" alt="Repo Size" />
  <img src="https://img.shields.io/github/last-commit/yourusername/construction-management-system?style=flat-square&color=success" alt="Last Commit" />
  <img src="https://img.shields.io/github/issues/yourusername/construction-management-system?style=flat-square" alt="Issues" />
  <img src="https://img.shields.io/github/stars/yourusername/construction-management-system?style=flat-square" alt="Stars" />
</div>

## 🚀 Key Features

### 👨‍💼 User Roles System
| Role | Badge | Access |
|------|-------|--------|
| Admin | ![Admin](https://img.shields.io/badge/-Admin-red) | Full system control |
| Engineer | ![Engineer](https://img.shields.io/badge/-Engineer-blue) | Project management |
| Finance | ![Finance](https://img.shields.io/badge/-Finance-green) | Financial operations |
| Worker | ![Worker](https://img.shields.io/badge/-Worker-yellow) | Daily operations |

### 📊 Core Modules

| Module | Icon | Description |
|--------|------|-------------|
| 👷 Worker Management | ![Worker](https://img.shields.io/badge/-Workers-ff69b4) | Complete workforce tracking |
| ✅ Attendance System | ![Attendance](https://img.shields.io/badge/-Attendance-9cf) | Real-time check-in/out |
| 📦 Inventory Control | ![Inventory](https://img.shields.io/badge/-Inventory-orange) | Material tracking |
| 🛠️ Order Management | ![Orders](https://img.shields.io/badge/-Orders-blueviolet) | Engineer order system |
| 💰 Finance Tracking | ![Finance](https://img.shields.io/badge/-Finance-brightgreen) | Budgets & expenses |

## 🛠️ Tech Stack

### Frontend
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB v6+
- npm v9+ or yarn

```bash
# Clone repository
git clone https://github.com/aizocraft/cms.git
cd construction-management-system
```

### Installation
```bash
# Install server dependencies
cd server && npm run server

# Install client dependencies
cd ../client && npm install
```

### Configuration
Create `.env` files in both folders using the provided `.env.example` templates.

### Running the App
```bash
# Start backend server
cd server && npm run dev

# Start frontend development server
cd ../client && npm start
```

## 📂 Project Structure

```
📦 construction-management-system
├── 📂 client
│   ├── 📂 public            # Static assets
│   └── 📂 src
│       ├── 📂 components     # Reusable UI components
│       ├── 📂 hooks         # Custom React hooks
│       ├── 📂 pages         # Route components
│       ├── 📂 utils         # Utility functions
│       └── 📜 App.js        # Main application
│
├── 📂 server
│   ├── 📂 config            # DB configuration
│   ├── 📂 controllers       # Business logic
│   ├── 📂 middleware        # Auth & validation
│   ├── 📂 models            # MongoDB schemas
│   ├── 📂 routes            # API endpoints
│   └── 📜 server.js         # Express server
│
└── 📜 README.md             # This documentation
```

## 🌐 API Documentation

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth` | POST | Public | User authentication |
| `/api/users` | GET | Admin | Get all users |
| `/api/attendance` | POST | Worker | Record attendance |
| `/api/inventory` | GET | Engineer+ | Get inventory items |
| `/api/orders` | POST | Engineer+ | Create new order |

> 🔗 Full API docs available in [API_DOCS.md](API_DOCS.md)

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📬 Contact

Project Maintainer: [Your Name](mailto:your.email@example.com)  
[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/kaiaizo)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/isaackariuki)

---

<div align="center">
  <img src="https://img.shields.io/badge/🚀-Deployed-success?style=for-the-badge" alt="Deployed" />
  <img src="https://img.shields.io/badge/🧑‍💻-Open_Source-informational?style=for-the-badge" alt="Open Source" />
</div>