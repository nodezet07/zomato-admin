# QuickBite Admin Panel

Platform administration dashboard for finance, settlements, riders, restaurants, and configuration.

## Stack

- React 19 + Vite 8 + TypeScript
- Tailwind CSS v4 (same UI as restaurant portal)
- React Query + Zustand
- Connects to `clone-backend` `/api/v1/admin/*`

## Setup

```bash
cd admin-panel
npm install
cp .env.example .env
npm run dev
```

Runs at **http://localhost:5175**

## Admin login

Seed admin user in backend:

```bash
cd ../clone-backend
npm run seed:admin
```

Default credentials:
- Email: `admin@foodapp.com`
- Password: `Admin@123`

## Features (MVP)

| Section | Description |
|---------|-------------|
| Dashboard | Users, restaurants, riders, orders, GMV, pending payouts |
| Restaurants | Approve/reject, per-restaurant commission |
| Riders | Approve/reject, earnings overview |
| Orders | All platform orders |
| Finance | Settlements, rider payouts, withdrawal approvals |
| Refunds | Refund ticket queue |
| Cities & Zones | Multi-city configuration |
| Ledger | Double-entry finance ledger |
| Platform Config | Commission, rider pricing, cancellation rules |

## Backend APIs

All under `/api/v1/admin/` — see `clone-backend/src/routes/admin.routes.ts`

New platform config endpoints:
- `GET/PATCH /admin/platform/policy`
- `GET/POST/PATCH /admin/platform/cities`
- `PATCH /admin/restaurants/:id/commission`
- `GET /admin/finance/ledger`
- `GET/PATCH /admin/finance/withdrawals/*`
