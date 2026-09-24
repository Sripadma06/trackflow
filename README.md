# TrackFlow — Military Asset Management System

Full-stack app for tracking asset purchases, transfers, assignments and
expenditures across bases, with role-based access control and audit logging.

## Stack
- Backend: Java 17, Spring Boot 3, Spring Security (JWT), Spring Data JPA/Hibernate
- Database: PostgreSQL
- Frontend: React 18 + Vite
- Docs: springdoc-openapi (Swagger UI at `/swagger-ui.html`)

## Why this stack (for the write-up)
- PostgreSQL: transactional integrity matters for a ledger of purchases/
  transfers/assignments — ACID guarantees prevent double-counted or lost
  movements, and relational FKs enforce that a transfer always references
  real bases/equipment. Aggregation (SUM by date range/base/type) is exactly
  what SQL is built for, which is what the dashboard needs.
- Spring Boot + JPA: fastest reliable path to a secured, validated REST API
  on a tight deadline, with mature JWT/RBAC support via Spring Security.
- React + Vite: fast dev/build loop, deploys as static files to Vercel/Netlify.

## Local setup

### 1. Database
```
createdb trackflow
# schema is auto-created by Hibernate (ddl-auto=update) on first boot,
# and db/schema.sql is provided separately as the required DB dump artifact.
```

### 2. Backend
```
cd trackflow-backend
# set env vars (or edit application.yml directly)
export DB_URL=jdbc:postgresql://localhost:5432/trackflow
export DB_USERNAME=postgres
export DB_PASSWORD=postgres
export JWT_SECRET=change-this-to-something-long-and-random
mvn clean package
mvn spring-boot:run
```
Backend runs on `http://localhost:8080`. Seed data (bases, equipment types,
demo users, a few demo transactions) loads automatically via `data.sql`.

### 3. Frontend
```
cd trackflow-frontend
npm install
cp .env.example .env   # VITE_API_BASE_URL=http://localhost:8080
npm run dev
```
Frontend runs on `http://localhost:5173`.

## Login credentials (seeded)
| Username    | Password       | Role              | Base        |
|-------------|----------------|-------------------|-------------|
| admin       | admin123       | ADMIN             | all bases   |
| cmd_alpha   | commander123   | BASE_COMMANDER    | Fort Alpha  |
| log_alpha   | logistics123   | LOGISTICS_OFFICER | Fort Alpha  |

## RBAC enforcement
Enforced server-side in two layers, not just hidden UI buttons:
1. `SecurityConfig` restricts which roles can hit which endpoints at all.
2. Inside services (`PurchaseService`, `TransferService`, `AssignmentService`,
   `DashboardService`), non-admins are pinned to their own `baseId` from the
   JWT claims — even if they send a different `baseId` in the request, the
   server overrides it. See `SecurityUtils.resolveBaseId`.

## API logging
Every write endpoint (login, create purchase/transfer/assignment, expend)
calls `AuditLogService.log(...)`, writing username, action, entity, entity
id, and details to the `audit_logs` table with a timestamp. Admins can view
these at `GET /api/audit-logs`.

## Key API endpoints
- `POST /api/auth/login`
- `GET /api/dashboard?baseId=&equipmentTypeId=&startDate=&endDate=`
- `GET/POST /api/purchases`
- `GET/POST /api/transfers`
- `GET/POST /api/assignments`, `PATCH /api/assignments/{id}/expend`
- `GET/POST /api/bases`, `GET/POST /api/equipment-types` (admin)
- `GET/POST /api/users` (admin)
- `GET /api/audit-logs` (admin)

Full interactive docs at `/swagger-ui.html` once the backend is running.

## Deployment

### Backend → Render
1. Push `trackflow-backend/` to a GitHub repo.
2. New → Web Service on Render, point at the repo, root directory `trackflow-backend`.
3. Build command: `mvn clean package -DskipTests`
4. Start command: `java -jar target/trackflow-backend-1.0.0.jar`
5. Add a Render PostgreSQL instance, then set env vars on the web service:
   `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`.

### Frontend → Vercel
1. Push `trackflow-frontend/` to a GitHub repo (or the same repo, separate root dir).
2. Import into Vercel, framework preset "Vite".
3. Set env var `VITE_API_BASE_URL` = your deployed Render backend URL.
4. Deploy.

## Assumptions / known limitations (state these in your write-up)
- Assigned assets remain "in inventory" until explicitly marked Expended;
  only Expended reduces the closing balance. This is a modeling choice for
  a "loaned but not consumed" interpretation of assignment.
- Transfers are recorded as a single completed event (no separate
  pending/approved workflow) — acceptable for the scope of this assignment.
- No soft-delete/edit on transactions; corrections would be a new offsetting
  entry, which preserves the audit trail (a real accounting-style ledger
  pattern).
