# BillionDue

**Turn invoices into income.**

BillionDue combines role-based admin and client portals with a Windows invoicing app. The portals manage companies, users, licenses, devices, and approval requests. The desktop app supports invoices, customers, products, payments, reports, offline license leases, and encrypted local backups.

## Features

- Separate Admin and Client sign-in with role and company-scoped access
- Neon PostgreSQL persistence for portal accounts and licensing data
- Windows desktop application with license and device checks
- Encrypted local storage for desktop business data and backups
- Offline license lease with periodic online renewal
- Guest trial mode for a limited period

## Project layout

```text
app/       Windows Electron desktop application
website/   Admin and Client portals plus the Node.js API
shared/    Shared domain logic and services
tests/     Automated tests
```

## Requirements

- Node.js 20 or later
- npm
- A Neon PostgreSQL database for the web portals and licensing API

## Run locally

Install dependencies from the repository root:

```powershell
npm install
```

Copy `.env.example` to `.env.local` and set `DATABASE_URL` to your Neon connection string. For a new database, also set `INITIAL_ADMIN_EMAIL`, `INITIAL_ADMIN_PASSWORD`, and `INITIAL_ADMIN_RECOVERY_KEY` to create the first administrator. Keep `.env.local` private and never commit database credentials.

Start the API and website:

```powershell
npm run dev
```

Open the website at `http://localhost:3001`. The API listens on port `8787` by default. `AUTO_MIGRATE=true` applies the database schema during API startup.

## Windows desktop app

Run the desktop app in development alongside the API:

```powershell
npm run electron:dev
```

Create a Windows installer and portable build:

```powershell
npm run dist:win
```

Build outputs are written to `app/release/`.

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the API and website |
| `npm run dev:website` | Start only the portal website |
| `npm run dev:api` | Start the API in watch mode |
| `npm run dev:app` | Start the desktop UI in a browser |
| `npm run electron:dev` | Start API, desktop UI, and Electron |
| `npm run build` | Build the website and desktop app |
| `npm test` | Run the test suite |
| `npm run dist:win` | Package Windows installer and portable app |

## Configuration

See `.env.example` for server settings, including `DATABASE_URL`, `API_PORT`, `WEB_ORIGIN`, `VITE_API_URL`, and initial administrator credentials. Never commit `.env.local` or publish database passwords.

## Status

BillionDue is currently an MVP. Review authentication, database access policies, licensing behavior, and backup recovery for your deployment before using it with production financial data.
