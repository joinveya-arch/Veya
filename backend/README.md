# VEYA Backend MVP

Welcome to the backend service of **VEYA**, a beauty-tech marketplace for beauty professionals and clients.

## Tech Stack
- **Runtime**: Node.js (TypeScript)
- **Framework**: Express.js
- **Database ORM**: Prisma with PostgreSQL
- **Security**: Helmet, CORS, Express-Rate-Limit, BCrypt, JWT
- **Logging**: Morgan & Winston

---

## Getting Started

### Prerequisites
Make sure you have the following installed on your system:
- **Node.js** (v20+)
- **Docker** and **Docker Compose**
- **npm** (comes with Node.js)

### 1. Installation
Install project dependencies:
```bash
npm install
```

### 2. Environment Configurations
Copy the template `.env.example` file to create your local `.env`:
```bash
cp .env.example .env
```
*(Optionally modify ports, JWT secret, and database passwords if needed)*

### 3. Spin up PostgreSQL Database
Start the database service in the background using Docker Compose:
```bash
docker-compose up -d
```
You can check database connection status by running:
```bash
docker ps
```

### 4. Run Prisma Database Migrations
Synchronize your local PostgreSQL database with the Prisma schema and auto-generate the type-safe Prisma Client:
```bash
npm run db:migrate
```

### 5. Running the Application

#### Development Mode
Run the Express application with live reload enabled:
```bash
npm run dev
```
The server will start by checking database connectivity and then listen on `http://localhost:5000`.

#### Production Mode
Build the TypeScript compilation to `dist/` and start the server:
```bash
npm run build
npm start
```

---

## Project Structure
Refer to [ARCHITECTURE.md](../ARCHITECTURE.md) in the workspace root directory for a detailed breakdown of the Clean Architecture pattern, directories, and logging configuration.

---

## Verifying Endpoints

### 1. API Health Check
Send a `GET` request to verify the server is up and database is connected:
```bash
curl http://localhost:5000/api/v1/health
```
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "status": "UP",
    "timestamp": "2026-07-10T17:10:00.000Z",
    "environment": "development"
  }
}
```

### 2. Route Not Found
Verify that requesting an invalid path returns a structured JSON 404 response:
```bash
curl http://localhost:5000/api/v1/nonexistent
```
**Expected Response:**
```json
{
  "success": false,
  "message": "Cannot find GET /api/v1/nonexistent on this server"
}
```
