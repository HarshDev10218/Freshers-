# 📦 CBIT Freshers' Faculty Invitation Tracker — Manual Deployment Folder

This folder (`deployment-ready/`) contains the complete, verified, production-ready codebase and resources for manually deploying the **Faculty Invitation Tracker** for **CBIT Freshers' Day (12 October 2026)**.

---

## 🗂️ Folder Structure

```text
deployment-ready/
├── frontend/                     # React 19 + TypeScript + Vite Single Page Application
│   ├── public/                   # Static assets (favicons, SVGs)
│   ├── src/                      # Components, types, business logic & UI
│   │   ├── components/           # Table, modals, mobile cards, toolbar, metrics
│   │   ├── data/                 # Verified CBIT departments & starter roster
│   │   ├── lib/                  # REST API client & real-time WebSocket manager
│   │   ├── types/                # TypeScript interfaces
│   │   ├── App.tsx               # Primary application state & socket binding
│   │   ├── index.css             # Ivory/Charcoal/Maroon editorial design system
│   │   └── main.tsx              # React DOM entrypoint
│   ├── index.html                # HTML template with Google Fonts typography
│   ├── vite.config.ts            # Vite proxy & build configuration
│   ├── tsconfig.json             # Root TypeScript config
│   ├── tsconfig.app.json         # Client TypeScript config
│   ├── tsconfig.node.json        # Node TypeScript config
│   ├── package.json              # Frontend dependencies manifest
│   ├── .env.example              # Frontend environment variables template
│   └── .gitignore                # Frontend version control ignore rules
│
├── backend/                      # Node.js + Express 5 + WebSockets + MongoDB server
│   ├── data/
│   │   └── faculty_store.json    # Verified 24-faculty local backup dataset
│   ├── server.js                 # Unified HTTP API, WebSocket broadcast & static file server
│   ├── package.json              # Minimal production dependencies
│   ├── .env.example              # Safe backend environment variables template
│   ├── .gitignore                # Backend secrets and log ignore rules
│   ├── Procfile                  # Cloud process start command (web: node server.js)
│   └── Dockerfile                # Standalone container build definition
│
├── database/                     # Database schemas, seeds, and initial datasets
│   ├── cbit_faculty_roster.json  # Complete 24-record official faculty roster (JSON)
│   ├── cbit_faculty_roster.csv   # Complete 24-record official faculty roster (CSV)
│   ├── seed_roster.js            # Node.js script to seed MongoDB Atlas & create indexes
│   ├── mongo_schema_indexes.js   # MongoDB document schema & index specifications
│   └── supabase_postgresql_schema.sql # Alternative PostgreSQL/Supabase schema
│
├── deployment-guides/            # Comprehensive documentation
│   ├── DEPLOYMENT.md             # Complete step-by-step manual deployment instructions
│   └── ENVIRONMENT_VARIABLES.md  # Inventory of all environment variables
│
└── README.md                     # This documentation file
```

---

## ⚡ Quick Deployment Summary

| If you want to: | Follow this guide: |
| :--- | :--- |
| **Deploy everything on Render or Railway** (Recommended) | Read [`deployment-guides/DEPLOYMENT.md#strategy-1-unified-fullstack-deployment-recommended`](file:///c:/Users/harshith/Desktop/Freshers/deployment-ready/deployment-guides/DEPLOYMENT.md) |
| **Deploy Frontend on Vercel/Netlify + Backend on Render** | Read [`deployment-guides/DEPLOYMENT.md#strategy-2-split-deployment-frontend--backend-separate`](file:///c:/Users/harshith/Desktop/Freshers/deployment-ready/deployment-guides/DEPLOYMENT.md) |
| **Deploy using Docker / VPS** | Read [`deployment-guides/DEPLOYMENT.md#option-c-any-linux-vps-ubuntu--debian--digitalocean--linode`](file:///c:/Users/harshith/Desktop/Freshers/deployment-ready/deployment-guides/DEPLOYMENT.md) |
| **Check which environment variables you need** | Read [`deployment-guides/ENVIRONMENT_VARIABLES.md`](file:///c:/Users/harshith/Desktop/Freshers/deployment-ready/deployment-guides/ENVIRONMENT_VARIABLES.md) |

---

## 🛡️ Production Verification Highlights

- **Zero Hardcoded Secrets**: All `.env.example` files contain safe placeholders; private credentials and production keys are excluded.
- **Pre-Configured Real-Time WebSocket**: Both relative (unified) and absolute (split) WebSocket URLs are supported out-of-the-box.
- **Pre-Seeded CBIT Roster**: The verified 24 faculty & staff members (including Junior Batch Faculty and Chemical Engineering staff) are included in [`database/cbit_faculty_roster.json`](file:///c:/Users/harshith/Desktop/Freshers/deployment-ready/database/cbit_faculty_roster.json).
- **TypeScript Verified**: Builds cleanly with `npm run build` in under 1 second.
