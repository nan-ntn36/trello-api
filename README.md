<div align="center">
  <br />
  <h1>Trello API</h1>
  <br />
  <div>
    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" alt="Node.js" width="40" height="40" />
    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" alt="Express.js" width="40" height="40" />
    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" alt="MongoDB" width="40" height="40" />
    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/socketio/socketio-original.svg" alt="Socket.io" width="40" height="40" />
  </div>
  <br />
  <p>Backend API for the Trello-inspired real-time task management platform.</p>
</div>

## 📋 Table of Contents

- [Introduction](#-introduction)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Requirements](#-requirements)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Run the Project](#-run-the-project)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)

## 🤖 Introduction

Trello API is a Node.js and Express.js backend for managing boards, columns, cards, members, authentication, file uploads, email invitations, and real-time collaboration. The API uses MongoDB for persistence and Socket.io for real-time events.

## 🔋 Features

- Board, column, and card management
- User authentication with access and refresh tokens
- Board member invitations and permissions
- File uploads through Cloudinary
- Real-time updates with Socket.io
- Email notifications through Brevo
- RESTful API with Swagger/OpenAPI documentation
- Request validation and centralized error handling

## ⚙️ Tech Stack

- Node.js and Express.js
- MongoDB with the official MongoDB driver
- JWT via `jsonwebtoken`
- Socket.io
- Cloudinary
- Brevo
- Babel and ESLint
- Swagger UI and OpenAPI

## 🧰 Requirements

- Node.js 22 LTS or Node.js 20 LTS
- Yarn 1.x or npm
- MongoDB
- Git

> The project currently depends on a legacy transitive package used by `jsonwebtoken`. Node.js 26 is not supported because that package references the removed `buffer.SlowBuffer` API.

## 🚀 Installation

Clone the repository and install its dependencies:

```bash
git clone <your-api-repository-url>
cd trello-api
yarn install
```

You can also use npm:

```bash
npm install
```

## 🔐 Environment Variables

Create a `.env` file in the project root based on [`.env.exemple`](./.env.exemple):

```env
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=trello-db

LOCAL_DEV_APP_HOST=localhost
LOCAL_DEV_APP_PORT=3692
AUTHOR=YourName

WEBSITE_DOMAIN_DEVELOPMENT=http://localhost:5173
WEBSITE_DOMAIN_PRODUCTION=https://your-production-web-domain.example

BREVO_API_KEY=your_brevo_api_key
ADMIN_EMAIL_ADDRESS=your-email@example.com
ADMIN_EMAIL_NAME=Trello Admin

ACCESS_TOKEN_SECRET_SIGNATURE=your_access_token_secret
ACCESS_TOKEN_LIFE=1h
REFRESH_TOKEN_SECRET_SIGNATURE=your_refresh_token_secret
REFRESH_TOKEN_LIFE=14 days

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Do not commit `.env` or real credentials to the repository.

## ▶️ Run the Project

Start the development server with automatic restart:

```bash
yarn dev
```

Or:

```bash
npm run dev
```

The API runs by default at:

```text
http://localhost:3692
```

Build the Babel output:

```bash
npm run build
```

Run the production build:

```bash
npm run production
```

Run ESLint:

```bash
npm run lint
```

## 📚 API Documentation

When the development server is running, open Swagger UI at:

```text
http://localhost:3692/api-docs
```

The OpenAPI definition is stored in [`swagger.yaml`](./swagger.yaml).

## 🗂️ Project Structure

```text
src/
├── config/         # Environment, MongoDB, and Swagger configuration
├── controllers/    # Request handlers
├── middlewares/    # Authentication, validation, and error middleware
├── models/         # Data models
├── providers/      # Cloudinary and Brevo integrations
├── routes/         # API route definitions
├── services/       # Business logic
├── sockets/        # Socket.io events
├── utils/          # Shared utilities and constants
└── validations/    # Joi validation schemas
```

## 📄 Available Scripts

| Script | Description |
| --- | --- |
| `yarn dev` | Start the development server with Nodemon and Babel |
| `npm run build` | Compile `src` into `build/src` |
| `npm run production` | Build and start the production server |
| `npm run lint` | Check JavaScript files with ESLint |

## 📜 License

This project is for learning and development purposes.
