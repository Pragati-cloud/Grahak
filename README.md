# QRDine — Smart Restaurant Ordering System

> **Zero friction. Zero commission. Zero waiting.**
> Customers scan once, order instantly, pay their way vendors get real-time orders with zero middlemen.

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-20_LTS-339933?logo=nodedotjs)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://mongodb.com)
[![SpacetimeDB](https://img.shields.io/badge/SpacetimeDB-1.x-FF6B35)](https://spacetimedb.com)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payment-0C2451?logo=razorpay)](https://razorpay.com)
[![ESP32](https://img.shields.io/badge/ESP32-IoT-E7352C)](https://espressif.com)

---

## What is QRDine?

QRDine is a full-stack, IoT-augmented restaurant ordering platform built for street vendors and small cafés. It eliminates front-of-house friction entirely — a customer scans a QR code at the table, browses the live menu, places an order, and pays, all without interacting with a waiter or downloading an app.

Orders reach the vendor in **real-time** via SpacetimeDB's push-based engine, fraud is blocked through cryptographic rotating QR tokens, and a coin-based reward system keeps customers coming back.

---

## Repo Structure

QRDine is split across **three separate repositories**:

| Repo | Contents |
|------|----------|
| **`qrdine-backend`** ← *this repo* | Node.js API server — shared by both the web app and the mobile app |
| `qrdine-frontend` | React web app — customer-facing ordering UI + vendor dashboard website |
| `qrdine-app` | Mobile app — separate repo, separate deployment |

> **Note:** This repository (`qrdine-backend`) contains only the `backend/` server. The `frontend/` folder in this repo is the **customer + vendor website** (not the mobile app). The mobile app lives in its own repository.

```
qrdine-backend/          ← you are here
├── backend/             # Node.js Express API server
│   ├── src/
│   │   ├── routes/      # Auth, orders, menu, payments, QR validation
│   │   ├── middleware/  # JWT auth, QR token validation, rate limiting
│   │   ├── models/      # Mongoose schemas (User, Vendor, Menu, Session)
│   │   ├── services/    # SpacetimeDB bridge, Razorpay webhooks
│   │   └── utils/       # Token helpers, HMAC verification
│   └── server.js
├── frontend/            # React web app (customer + vendor dashboard)
│   ├── src/
│   │   ├── pages/       # Menu, Cart, Checkout, VendorDashboard
│   │   ├── components/  # Reusable UI components
│   │   └── hooks/       # SpacetimeDB subscriptions
│   └── index.html
├── .env.example
├── metadata.json
└── README.md
```

---

## Features

- **Single Scan Ordering** — Customers scan once to instantly access the menu and place orders without any extra steps.
- **Quick Menu & Order** — Simple, fast interface to browse items and place orders in just a few taps.
- **Cash + Online Payments** — Supports both digital payments (Razorpay — UPI, cards) and cash, making it flexible for all users.
- **Secure QR Verification** — Rotating 30-second QR tokens ensure only physically present customers can place orders, preventing relay and screenshot fraud.
- **Real-Time Order Tracking** — Customers and vendors get live push updates on order status without ever refreshing the page — powered by SpacetimeDB subscriptions.
- **Vendor Dashboard + Automation** — Vendors receive orders instantly with automated alerts and one-tap order management (Received → Preparing → Ready → Served).
- **AI Analytics (Gemini)** — Smart insights like popular items and sales trends to help vendors grow their business.
- **Reward System** — Customers earn coins on every order, encouraging repeat usage and loyalty.
- **Zero Commission** — No platform fees. Vendors keep 100% of their revenue.

---

## Architecture Overview

QRDine uses a **hybrid architecture** — each component is chosen for what it does best:

```
ESP32 (IoT)          →  rotating QR code every 30s
Customer (browser)   →  scans QR, opens React web app
React frontend       →  menu, cart, payment UI
Node.js backend      →  auth, QR validation, REST APIs       ← this repo
MongoDB              →  users, vendors, sessions, menu data
SpacetimeDB          →  live orders, real-time push to vendor
Razorpay             →  online payments + webhook verification
```

For a full layer-by-layer breakdown, see [`QRDine_Architecture.pdf`](./docs/QRDine_Architecture.pdf) in the docs folder.

### Key Design Decisions

| Decision | Why |
|----------|-----|
| SpacetimeDB for orders | Sub-50ms push delivery; no WebSocket server, no Redis pub/sub needed |
| MongoDB for auth | Flexible document schema handles varied vendor/menu structures |
| Rotating QR tokens | Prevents QR relay attacks (screenshot and order remotely) |
| Node.js as bridge | I/O-bound workload (auth, DB queries, payment callbacks) — ideal for the event loop |
| Razorpay webhook HMAC | Server-side payment verification; never trust client-side success callbacks |

---

## Prerequisites

- **Node.js** 20 LTS
- **npm** 9+
- **MongoDB Atlas** account (or local MongoDB instance)
- **SpacetimeDB** 1.x running instance
- **Razorpay** account (for payment features)

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-org/qrdine-backend.git
cd qrdine-backend
```

### 2. Install dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/qrdine

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=8h
REFRESH_TOKEN_SECRET=your_refresh_secret_here

# QR Token
QR_TOKEN_SECRET=your_qr_hmac_secret
QR_TOKEN_TTL=30              # seconds

# SpacetimeDB
SPACETIMEDB_HOST=localhost
SPACETIMEDB_PORT=3000
SPACETIMEDB_MODULE=qrdine

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# CORS
ALLOWED_ORIGIN=http://localhost:3000

# Gemini AI (optional — for analytics)
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Run in development

```bash
# Start backend (from /backend)
npm run dev

# Start frontend (from /frontend)
npm run dev
```

Backend runs on `http://localhost:5000` · Frontend runs on `http://localhost:3000`

---

## API Reference

The Node.js backend exposes the following REST endpoints:

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/login` | None | Vendor login → returns JWT |
| `GET` | `/api/menu/:restaurantId` | None | Fetch live menu for a restaurant |
| `POST` | `/api/orders` | QR Token | Create new order (validates token + initiates payment) |
| `GET` | `/api/orders/:restaurantId` | Vendor JWT | Fetch all orders for a vendor |
| `PATCH` | `/api/orders/:id/status` | Vendor JWT | Update order status (e.g. Preparing → Ready) |
| `POST` | `/api/payment/verify` | HMAC secret | Razorpay webhook handler |
| `POST` | `/api/qr/validate` | None | Validate QR token TTL + HMAC signature |

For full request/response schemas, import `QRDine_postman_collection.json` into Postman.

---

## Real-Time Orders (SpacetimeDB)

QRDine uses SpacetimeDB reducers instead of a traditional REST + WebSocket setup:

```rust
// Client subscribes declaratively — server pushes on any change
db.subscribe("SELECT * FROM Order WHERE restaurant_id = 'rid_01'");
```

When a new order is placed, Node.js calls the `createOrder` reducer. SpacetimeDB atomically persists the record and pushes a delta to all active subscribers (vendor dashboard + customer app) in under 50ms — no polling loop, no separate WebSocket server.

---

## Security

- **QR Token Validation** — Every order carries a 30-second HMAC-SHA256 signed JWT. Node.js verifies signature and expiry before touching the database.
- **Payment Webhook Verification** — Razorpay webhooks are verified server-side using `X-Razorpay-Signature` (HMAC-SHA256). Mismatches are silently dropped.
- **JWT Auth** — Vendor JWTs expire in 8 hours. Refresh tokens (30 days) are stored in HTTP-only cookies.
- **CORS** — Restricted to the known frontend origin via environment variable.
- **Rate Limiting** — `POST /api/orders` is throttled to 10 requests/min per IP.
- **MongoDB Injection Prevention** — All queries use parameterised Mongoose methods. `$where` and `eval` are disabled at the Atlas level.

---

## IoT — ESP32 QR Device

The ESP32 microcontroller at each table generates a new QR code every 30 seconds. The QR payload is a signed token containing `table-id`, `restaurant-id`, and a short-lived nonce. The backend validates this token before accepting any order, enforcing physical presence.

> **ESP32 code lives in a separate `/iot` folder or repo.** See its own README for flashing instructions.

---

## Mobile App

The QRDine mobile app is maintained in a **separate repository**. It consumes the same Node.js backend API documented here. Refer to the mobile app repo for setup and build instructions.

---

## Scripts

```bash
# Backend
npm run dev          # Start with nodemon (hot reload)
npm start            # Production start
npm test             # Jest + Supertest integration tests

# Frontend
npm run dev          # Vite dev server
npm run build        # Production build
npm run preview      # Preview production build locally
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite, SpacetimeDB TS SDK, Razorpay.js |
| Backend | Node.js 20, Express 4, jsonwebtoken, Mongoose |
| Auth DB | MongoDB Atlas 7.0 |
| Real-time | SpacetimeDB 1.x (Rust reducers, WASM) |
| Payments | Razorpay API v1 + Webhooks |
| IoT | ESP32 (Arduino / IDF) |
| AI Analytics | Google Gemini API |
| DevOps | Docker, PM2 |
| Testing | Jest, Supertest, Playwright |

---

## Contributing

1. Fork the repo and create a feature branch: `git checkout -b feat/your-feature`
2. Commit your changes: `git commit -m "feat: add your feature"`
3. Push to your branch: `git push origin feat/your-feature`
4. Open a Pull Request — describe what you changed and why

Please follow the existing code style and ensure all tests pass before submitting.

---

## License

This project is proprietary and confidential. All rights reserved © QRDine 2025.

---

> **Interview one-liner:** *"QRDine is a hybrid-architecture restaurant SaaS: React handles the customer UX, Node.js acts as the auth and validation bridge, MongoDB persists identity and vendor data, SpacetimeDB drives sub-50ms real-time order delivery, and an ESP32 rotates QR tokens every 30 seconds to prevent fraud."*
