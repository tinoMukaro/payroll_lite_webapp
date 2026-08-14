# Payroll Lite Web App

**Release:** `1.0.0` | **Status:** V1 feature-complete for learning, demonstration, and local development

Payroll Lite Web App is the React and TypeScript client for the Payroll Lite API. It provides focused workspaces for Administrators, HR staff, and Employees without introducing a heavy design system.

## V1 capabilities

- Public registration and JWT login.
- Role-aware navigation for `ADMIN`, `HR`, and `EMPLOYEE` users.
- Employee creation and generated employee-number display.
- Payroll run creation, preview, processing, and payslip review.
- One-off and fixed recurring earnings and deductions.
- NSSA and PAYE configuration screens for Admin and HR.
- Admin user-role management with explicit save feedback.
- Admin-only, filterable business audit trail.
- Employee self-service access to their own payslips.
- Secure PDF payslip downloads.

## Technology

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Native Fetch API
- ESLint

## Prerequisites

- Node.js compatible with Vite 8.
- npm.
- Payroll Lite API running at `http://localhost:9090` unless overridden.

## Local setup

Install dependencies:

```bash
npm install
```

Create the local frontend configuration:

PowerShell:

```powershell
Copy-Item .env.example .env
```

Bash:

```bash
cp .env.example .env
```

Start the development server:

```bash
npm run dev
```

Open `http://localhost:5173`.

## Container image

The multi-stage `Dockerfile` builds the TypeScript application with Node.js and serves
only the generated static assets from Nginx:

```bash
docker build --build-arg VITE_API_URL=/api -t payroll-lite-webapp .
```

For the complete PostgreSQL, API, and web stack, use `compose.yaml` from the sibling
Payroll Lite API repository. In that setup Nginx proxies `/api` to the API container,
so browser requests use one origin and do not require a container-specific CORS
configuration.

## Configuration

The only V1 frontend variable is:

```properties
VITE_API_URL=http://localhost:9090/api
```

Vite embeds `VITE_` variables into the browser bundle. Never place database credentials, JWT signing secrets, passwords, or other private values in frontend environment files.

The real `.env` is ignored by Git. Commit only `.env.example`.

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and create the production bundle |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the built production bundle locally |

## Access model

| Workspace | Main capabilities |
| --- | --- |
| Admin | Full payroll and employee access, statutory configuration, user-role management, and audit history |
| HR | Employee and payroll management plus statutory configuration |
| Employee | View and download only the employee's own payslips |

Authorization is enforced by the API. Hiding a frontend screen is a usability measure and is not treated as a security boundary.

## Related repository

The backend API, complete endpoint documentation, domain rules, and bootstrap instructions are maintained in the [Payroll Lite API repository](https://github.com/tinoMukaro/payroll_lite).

## V1 boundary

This client is suitable for learning, demonstrations, and local development. It is not presented as a certified production payroll system. Review the backend README for statutory and operational limitations.

## License

No license has been declared yet. Add a `LICENSE` before distributing the project or accepting external contributions.
