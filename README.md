# FixIt — On-Demand Service Request & Repair Network

> **A Production-Grade Full-Stack Service Booking & Repair Network** connecting customers with background-verified, certified technicians (Electrical, Plumbing, HVAC, Carpentry, Electronics, and Home Appliances). Powered by **Razorpay Payment Gateway (Test/Sandbox Mode)** with HMAC-SHA256 cryptographic verification, bidirectional **Socket.IO** real-time dispatch & chat, multi-source media uploads, and end-to-end job status tracking.

🌐 **Live Demo:** [https://fixit-aman.vercel.app](https://fixit-aman.vercel.app) &nbsp;|&nbsp; 🖥️ **Backend API:** [https://fixit-dk08.onrender.com](https://fixit-dk08.onrender.com)

---

## 🏗️ Architecture & Tech Stack

```text
React 18 (Vite 5 + TailwindCSS + Lucide Icons)
      ↓ (Axios + Real-time Socket.IO)
Node.js + Express.js Modular REST API
      ↓ (JWT Auth + bcrypt + RBAC + Zod Validation)
Prisma ORM (Connection Pooler & Type-safe Queries)
      ↓
Neon PostgreSQL (Cloud Serverless Database)
      ↓
Cloudinary (Media Storage) + Redis/Upstash (Cache) + Socket.IO (Live Chat & Alerts)
```

| Component | Technology / Library | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite 5, TailwindCSS | High-performance SPA with responsive design & dark/light theme |
| **Icons & Visuals** | Lucide React | Clean, scalable modern SVG icons across all interfaces |
| **Backend** | Node.js 20+, Express.js | Modular controller-service-repository architecture |
| **Database** | **Neon PostgreSQL** (Cloud) | Fully managed serverless relational database |
| **ORM** | Prisma ORM | Type-safe queries, connection pooling & schema migrations |
| **Authentication** | JWT + bcryptjs (12 rounds) | Secure Access Tokens + HttpOnly Refresh Tokens with DB rotation |
| **Real-Time Layer**| Socket.IO | Bidirectional WebSocket engine for live chat & instant dispatch |
| **File Uploads** | Multer + Cloudinary | Universal image formats (JPEG, PNG, WebP, GIF, SVG, BMP, HEIC) |
| **Caching & Rate** | Redis / Upstash | Distributed session caching & reverse proxy rate limiters |
| **Frontend Deploy** | Vercel | Auto-deploy from GitHub with SPA rewrites & API proxy |
| **Backend Deploy** | Render | Managed Node.js cloud server with environment secrets |

---

## ⚡ Key Features

### 👤 Customer Experience
- **5-Step Interactive Request Wizard**: Service selection, symptom checklist, multi-source image attachments (Device files, Live Camera, Image URL, Sample breakdown presets), and preferred scheduling.
- **Active Job Center**: Filter by `ALL`, `PENDING`, `ACCEPTED`, `COMPLETED` with realtime status updates.
- **Live Chat Modal**: Instant real-time Socket.IO messaging with the assigned technician with persistent chat cache.
- **Service History & Invoices**: Detailed repair receipts, time logs, and technician rating reviews.
- **⭐ Star Rating & Review System**: After a job is completed, customer can leave a 1–5 star rating with a written comment for the technician. Review is displayed on the request detail page and contributes to the technician's live average rating.
- **Razorpay Payments**: Pay for completed service requests directly within the app (Test/Sandbox mode).

### 🔧 Technician Workspace
- **Smart Auto-Dispatch**: Direct job allocations for electrical, plumbing, HVAC, appliances, and electronics.
- **Assigned Jobs Manager**: Accept or decline tickets, transition statuses (`Start Job` → `Mark Complete`), and coordinate live with customers.
- **Earnings & Rating Dashboard**: Live tracking of completed jobs, total revenue (₹10,000+ stat metrics), and client reviews.
- **Custom Trade Avatars**: Profile customization with industry-specific avatars (Electrician, Plumber, HVAC Expert, Appliance Tech, Electronics Pro, Lead Technician).
- **Review Notifications**: Instant notification when a customer leaves a star review for a completed job.

### 🛡️ Super Admin Control Center & Operations
- **KPI Metrics & Analytics**: Platform revenue analytics, active request volumes, and technician verification queue.
- **Technician Verification**: Government ID & certificate inspection with one-click approve/reject actions.
- **Global Ticket Management**: Oversee all service requests across cities, with **Inspect** button to view full request detail (including customer review, payment, technician, and timeline).
- **Security & Activity Audit**: Comprehensive audit logs capturing IP addresses, endpoints, timestamps, and user agents.
- **Review Visibility**: Admin can view the customer's submitted review (stars + comment) on any request detail page.

### 🌓 Ultra High-Contrast Dark & Light Themes
- Custom CSS design tokens tailored for crisp contrast in both sunny outdoor and dark environment conditions.
- Smooth transitions with system theme auto-detection.

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- **Node.js** v20+ & **npm** v10+
- **PostgreSQL** database (e.g., [Neon Cloud](https://neon.tech))

### 2. Clone & Install

```bash
git clone https://github.com/Aman5ingh19/FixIt.git
cd FixIt

# Install backend dependencies
cd server
npm install
cd ..

# Install frontend dependencies
cd client
npm install
cd ..
```

### 3. Environment Setup

Create `.env` inside `server/`:

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# Neon PostgreSQL (Cloud Database)
DATABASE_URL="postgresql://neondb_owner:your_password@ep-sample-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&connection_limit=10&pool_timeout=15"
DIRECT_URL="postgresql://neondb_owner:your_password@ep-sample.us-east-2.aws.neon.tech/neondb?sslmode=require"

# JWT Authentication
JWT_ACCESS_SECRET=fixit-dev-access-secret-change-in-production
JWT_REFRESH_SECRET=fixit-dev-refresh-secret-change-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Redis / Upstash (Optional)
REDIS_URL="rediss://default:your_redis_token@your_instance.upstash.io:6379"

# Cloudinary (Optional image cloud hosting)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Database Migration & Seeding

```bash
cd server
npx prisma db push
npm run db:seed
cd ..
```

> ✅ The server also **auto-seeds** demo accounts on first startup if the database is empty — no manual step needed on fresh deployments.

### 5. Start Development Servers

Run both servers concurrently:

```bash
# Terminal 1: Backend Server (Port 5000)
cd server
npm run dev

# Terminal 2: Frontend Client (Port 5173)
cd client
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🔑 Pre-Configured Demo Credentials

Password for all pre-seeded accounts: **`Password123!`**

| Role | Email | Password | Primary Portal |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@fixit.com` | `Password123!` | `/admin/dashboard` |
| **Demo Customer** | `customer@fixit.com` | `Password123!` | `/customer/dashboard` |
| **Demo Technician** | `tech@fixit.com` | `Password123!` | `/technician/dashboard` |

*💡 Tip: Use the **⚡ Quick Demo Logins** buttons on the Login page for instant one-click access.*

---

## 📁 Project Structure

```text
FixIt/
├── client/                     # React 18 SPA Frontend
│   ├── public/                 # Static assets & brand favicon
│   ├── src/
│   │   ├── components/         # Common UI (Button, Card, Modal, Badge, ThemeToggle)
│   │   │   ├── chat/           # Real-time Socket.IO ChatPanel
│   │   │   ├── guards/         # ProtectedRoute & RoleGuard
│   │   │   └── layouts/        # DashboardLayout, Sidebar, Topbar, AuthLayout
│   │   ├── contexts/           # AuthContext, SocketContext, LanguageContext
│   │   ├── pages/
│   │   │   ├── admin/          # Dashboard, Technicians, Requests, Payments, ActivityLog
│   │   │   ├── auth/           # LoginPage, RegisterPage
│   │   │   ├── customer/       # Dashboard, CreateRequest, ActiveRequests, Detail, History, ReviewPage
│   │   │   ├── landing/        # LandingPage
│   │   │   ├── shared/         # AboutPage, HowToUsePage, NotificationsPage, ProfilePage, SettingsPage
│   │   │   └── technician/     # Dashboard, AvailableRequestsPage, AssignedJobsPage
│   │   └── services/           # Axios API clients (auth, request, review, technician, payment)
│   ├── vercel.json             # Vercel deploy config & API proxy rewrites
│   └── package.json
│
├── server/                     # Node.js + Express.js REST API
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema (Users, Requests, TechProfiles, Reviews, Chats)
│   │   └── seed.js             # Initial database seeder (auto-runs on fresh deploy)
│   ├── src/
│   │   ├── config/             # Database, Redis, Socket, Multer, Logger, Cloudinary
│   │   ├── controllers/        # Auth, Request, Technician, Review, Notification, Upload
│   │   ├── middleware/         # AuthGuard, RBAC, RateLimiter, Security, ErrorHandler
│   │   ├── repositories/       # Prisma query abstraction layer
│   │   ├── routes/             # Express API routes
│   │   ├── services/           # Business logic, Auto-matching engine, Token generators
│   │   └── validators/         # Zod request validation schemas
│   └── package.json
│
├── docker-compose.yml          # Container orchestration (local dev)
├── vercel.json                 # Root Vercel project config
└── README.md                   # Project documentation
```

---

## 📡 Core API Endpoints

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/register` — Register new Customer or Technician account
- `POST /api/auth/login` — Sign in and issue JWT access/refresh tokens
- `POST /api/auth/refresh` — Rotate and issue fresh access token
- `POST /api/auth/logout` — Revoke active session tokens
- `GET  /api/auth/me` — Fetch currently authenticated user profile

### 📋 Service Requests (`/api/requests`)
- `POST /api/requests` — Create new service request with location & image attachments
- `GET  /api/requests/my` — Fetch requests belonging to authenticated customer
- `GET  /api/requests/:id` — Fetch complete request details, technician info & timeline
- `POST /api/requests/:id/cancel` — Cancel an open service request
- `POST /api/requests/:id/confirm` — Confirm completion and finalize job
- `GET  /api/requests` — Admin: fetch all requests across the platform
- `GET  /api/requests/stats` — Admin: KPI totals (users, technicians, requests, completions)

### 🔧 Technician Workflows (`/api/technicians`)
- `GET  /api/technicians/profile` — Fetch technician stats, rating & earnings
- `GET  /api/technicians/assigned` — Fetch active assigned jobs
- `GET  /api/technicians/available` — Fetch nearby open requests for acceptance
- `POST /api/technicians/jobs/:id/accept` — Accept assigned repair ticket
- `POST /api/technicians/jobs/:id/status` — Update job status (`IN_PROGRESS` / `COMPLETED`)

### ⭐ Reviews (`/api/reviews`)
- `POST /api/reviews` — Customer: submit star rating + comment for a completed request
- `GET  /api/reviews/technician/:id` — Public: fetch all reviews for a specific technician
- `GET  /api/reviews` — Admin: fetch all platform reviews

### 💳 Payments & Razorpay (`/api/payments`)
- `GET  /api/payments/config` — Fetch public Razorpay key ID & active payment mode
- `POST /api/payments/create-order` — Create backend Razorpay order with server-calculated price
- `POST /api/payments/verify-signature` — Cryptographically verify HMAC-SHA256 signature and mark `PAID`
- `GET  /api/payments/my-history` — Fetch customer payment transaction history & receipts
- `GET  /api/payments/stats` — Admin KPI overview (total revenue, paid volume, failure rate)
- `POST /api/payments/webhook` — Process asynchronous Razorpay webhook events

---

## 💳 Razorpay Payment Gateway (Test Mode & Live Transition)

FixIt features a production-grade, secure **Razorpay Payment Gateway** with backend order management, cryptographic HMAC-SHA256 signature verification, and automated transaction state machines.

### 🧪 Test Mode (Sandbox Simulation)
- **Zero-Friction Testing**: No real bank transactions occur. The platform supports simulated payments (UPI, Debit/Credit Card, Netbanking) with instant transaction ID generation and server-side signature verification.
- **Payment Lifecycle**: `PENDING` → `PAID` (or `FAILED` / `REFUNDED`).
- **Customer Portal**: `/customer/payments` tracks all receipts and lets users pay pending service requests with one click.
- **Admin Control**: `/admin/payments` provides a platform-wide revenue dashboard and searchable transaction audit log.

### 🃏 Test Credentials for Razorpay Checkout (Sandbox)

When the **Razorpay payment popup** opens during a demo, use the following **test credentials** — no real money is charged:

#### ✅ Successful Payment — Test Cards

| Card Type | Card Number | Expiry | CVV | OTP |
| :--- | :--- | :--- | :--- | :--- |
| **Visa (Success)** | `4111 1111 1111 1111` | Any future date | Any 3 digits | `1234` |
| **Mastercard (Success)** | `5267 3181 8797 5449` | Any future date | Any 3 digits | `1234` |
| **Rupay (Success)** | `6073 8490 0000 0001` | Any future date | Any 3 digits | `1234` |

> 💡 **OTP:** Always enter `1234` on the simulated bank OTP screen.

#### ❌ Failed Payment — Test Cards (to simulate failure)

| Card Number | Expected Result |
| :--- | :--- |
| `4000 0000 0000 0002` | Payment Declined |
| `4000 0000 0000 9995` | Insufficient Funds |

#### 📱 UPI (Success)
| Field | Value |
| :--- | :--- |
| **UPI ID** | `success@razorpay` |

#### 🏦 Netbanking
Select **any bank** from the list → You will be redirected to a dummy bank page → Click **"Success"**.

#### 📋 Quick Demo Steps
1. Login as **Customer** (`customer@fixit.com` / `Password123!`)
2. Open a completed service request from **Active Requests** or **History**
3. Click **"⚡ Pay with Razorpay"**
4. In the popup → Choose **Card** → Enter `4111 1111 1111 1111`, any future date, any CVV
5. Enter OTP `1234` → Payment marked **PAID** ✅

### 🔑 Adding Your Free Razorpay Test Keys (Recommended for Portfolio / Demos)
To open the official Razorpay branded checkout popup in Test Mode:
1. Sign up for free at **[dashboard.razorpay.com](https://dashboard.razorpay.com)**.
2. In the top navbar, toggle the switch from *Live Mode* to **"Test Mode"**.
3. Navigate to **Account & Settings → API Keys → Generate Key**.
4. Copy your credentials into `server/.env`:
   ```env
   RAZORPAY_KEY_ID=rzp_test_yourKeyId
   RAZORPAY_KEY_SECRET=yourKeySecret
   RAZORPAY_WEBHOOK_SECRET=yourWebhookSecret
   ```
5. Restart your server (`npm run dev` in `server/`).

### 🚀 Transitioning from Test Mode to Live Mode in Production
When you are ready to accept real money in production:
1. Complete your KYC on the **Razorpay Dashboard**.
2. Toggle the dashboard switch to **"Live Mode"**.
3. Generate **Live API Keys** under **Account & Settings → API Keys**.
4. Update your production environment variables (e.g. on Render):
   ```env
   NODE_ENV=production
   RAZORPAY_KEY_ID=rzp_live_yourLiveKeyId
   RAZORPAY_KEY_SECRET=yourLiveKeySecret
   RAZORPAY_WEBHOOK_SECRET=yourLiveWebhookSecret
   ```
5. Set up your Webhook URL in Razorpay Dashboard pointing to:
   `https://fixit-dk08.onrender.com/api/payments/webhook`
   Subscribed events: `payment.captured`, `payment.failed`, `refund.processed`.
6. No frontend or code changes required — the platform automatically adapts to Live credentials securely!

---

## ☁️ Deployment

### Frontend — Vercel
- Connected to GitHub (`main` branch) — auto-deploys on every push.
- `vercel.json` contains SPA rewrites (all routes → `index.html`) and API proxy (`/api/*` → Render backend).
- No environment variables needed on Vercel — the production build hardcodes the Render backend URL.

### Backend — Render
- Deployed as a **Web Service** from the `server/` directory.
- Build command: `npm install && npx prisma generate`
- Start command: `node src/server.js`
- Environment variables set directly in Render Dashboard (DATABASE_URL, JWT secrets, Razorpay keys, Cloudinary, Redis).
- Server **auto-runs Prisma migrations and seeds demo data** on first startup if the database is empty.

---

## 👨‍💻 Author & Credits

- **Platform Architect & Developer:** **Aman Singh**
- **GitHub:** [github.com/Aman5ingh19](https://github.com/Aman5ingh19)

- **Designed for:** Scalable, reliable, on-demand home & appliance repair network across India.

---

## 📄 License

This project is open source and available under the **[MIT License](LICENSE)**.
