# ERP System – Developer Onboarding & Workflow Guide

Welcome to the **ERP System** project! This guide documents the architecture, local setup procedures, coding conventions, and collaboration workflow for the engineering team.

---

## 1. System Architecture Overview

The platform is designed as a **Modular Monolith** using **npm workspaces**:

```text
ERP-System/
├── apps/
│   ├── api/          # Node.js + Express + Prisma + PostgreSQL (Backend API)
│   └── web/          # React 18 + Vite + Tailwind CSS (Web Frontend)
├── packages/
│   ├── shared/       # Shared TypeScript types, API contracts, constants
│   └── config/       # Shared TSConfig & tooling configurations
├── infrastructure/   # Deployment & cloud infrastructure configs
├── docs/             # Technical specifications & architectural decisions
├── docker-compose.yml# Local development services (PostgreSQL 16)
└── package.json      # Monorepo root workspace definition
```

---

## 2. Prerequisites

Ensure your workstation has the following installed:

- **Node.js**: `v20.0.0` or higher (Recommended: LTS `v22.x`)
- **npm**: `v10.0.0` or higher
- **Docker Desktop**: With Docker Compose enabled
- **Git**: Configured with your GitHub account

---

## 3. Quickstart: Step-by-Step Setup (For Kenenisa)

Follow these exact steps after cloning the repository to get your environment running:

### Step 1: Clone and Enter the Repository
```bash
git clone https://github.com/EndriasEshetu/ERP-System.git
cd ERP-System
```

### Step 2: Configure Environment Variables
Copy the template `.env.example` to create your local `.env`:
```bash
# On Linux / macOS / Git Bash
cp .env.example .env

# On Windows PowerShell
Copy-Item .env.example .env
```
*(The defaults in `.env.example` work out-of-the-box for local Docker development).*

### Step 3: Install All Workspace Dependencies
From the repository root, run:
```bash
npm install
```
*npm will install dependencies across all apps and automatically link `@erp/shared` and `@erp/config`.*

### Step 4: Start Local PostgreSQL Database
```bash
npm run db:up
```
Verify the container is healthy:
```bash
docker ps --filter "name=erp-postgres"
```

### Step 5: Run Database Migrations & Generate Prisma Client
```bash
npx prisma generate --schema=apps/api/prisma/schema.prisma
npx prisma migrate dev --name init --schema=apps/api/prisma/schema.prisma
```

### Step 6: Start Full-Stack Development Servers
Run both API and Web concurrently with one command:
```bash
npm run dev
```

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
- **API Health Check**: [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)

---

## 4. Module Ownership & Responsibilities

| Lead Developer | Assigned Business Modules |
| :--- | :--- |
| **Endrias** | Architecture, Auth & Sessions, Organizations & Multi-tenancy, Users & RBAC, CRM, Sales, Invoicing |
| **Kenenisa** | Products & Categories, Warehouses & Inventory Movements, Suppliers, Purchasing, Goods Receiving, Notifications, Reporting |

Each developer implements the **complete vertical slice** of their module: database models, backend controllers/services, frontend UI pages/components, and tests.

---

## 5. Development Standards & Rules

### A. Multi-Tenancy Scoping (Critical)
- Every business entity **must** extend `TenantScopedEntity` from `@erp/shared`.
- All database queries and mutations **must** include `organizationId` filter criteria.
- Cross-tenant data leakage is a critical architectural violation.

### B. Standard API Response Convention
All endpoints in `apps/api` must use the `/api/v1` prefix and return standard envelopes:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Email is already in use", "code": "EMAIL_EXISTS" }
  ]
}
```

### C. Git Workflow & Branches
- **Never push directly to `main`**.
- Branch naming convention:
  - Features: `feature/<module>-<short-description>` (e.g. `feature/crm-customers`)
  - Bug fixes: `fix/<module>-<short-description>` (e.g. `fix/inventory-stock-calc`)
- Open a Pull Request targeting `main`. Fill in the PR checklist from `.github/pull_request_template.md`.

---

## 6. Command Reference

| Command | Description |
| :--- | :--- |
| `npm run dev` | Run backend API and frontend web concurrently |
| `npm run dev:api` | Run backend API only with auto-restart (`tsx watch`) |
| `npm run dev:web` | Run frontend web app only (`vite`) |
| `npm run typecheck` | Run TypeScript strict checking across all workspaces |
| `npm run build` | Build all packages and applications for production |
| `npm run format` | Format code across all workspaces with Prettier |
| `npm run format:check` | Check code formatting across all workspaces |
| `npm run db:up` | Start local PostgreSQL 16 container |
| `npm run db:down` | Stop local PostgreSQL 16 container |
| `npm run db:logs` | Stream PostgreSQL logs |

