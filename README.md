# Celet — Business OS

Celet is a multi-tenant business operating system for small and growing businesses. It brings customer records, sales, invoices, appointments and operational reporting into one focused workspace.

## Product standard
Celet is being built as a real SaaS product, not a static dashboard demo. The architecture separates identity, business workspaces and workspace data so the product can grow into team accounts, automation, reporting and white-label deployments.

## Implemented
- Premium responsive SaaS dashboard
- Firebase Authentication with email/password
- Business workspace creation during signup
- Persistent user/workspace relationship in Firestore
- Tenant-isolated Firestore rules
- Customer collection wired to Firestore
- Customer search and live updates
- Mobile-responsive application shell
- Revenue, activity and transaction dashboard foundation
- Production-oriented environment configuration

## Stack
- React + TypeScript
- Vite
- Firebase Authentication
- Cloud Firestore
- Lucide icons

## Local setup
1. Create a Firebase project and enable Email/Password Authentication.
2. Create a Firestore database.
3. Copy `.env.example` to `.env` and fill in the Firebase web app values.
4. Install dependencies and run the app:

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## Netlify configuration
Add the `VITE_FIREBASE_*` values from `.env.example` under Site configuration → Environment variables, then redeploy.

## Security
`firestore.rules` enforces authentication and derives the current business workspace from the signed-in user's `/users/{uid}` record. Workspace subcollections are readable and writable only inside that business boundary.

## Roadmap
1. Full CRUD for customers, products/services, invoices and appointments
2. Invoice PDF/print and payment status workflows
3. Role-based staff accounts and permissions
4. Revenue analytics with real Firestore aggregations
5. WhatsApp communication actions
6. Notifications and activity timeline
7. Business settings, branding and white-label controls
8. Platform administration and subscription layer
9. Demo workspace and guided onboarding
10. Automated tests, CI and acquisition-ready documentation
