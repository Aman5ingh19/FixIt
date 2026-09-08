# FixIt — On-Demand Service Request & Repair Network

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://fix-it-nu-sable.vercel.app)
[![Backend API](https://img.shields.io/badge/Backend_API-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://fixit-dk08.onrender.com)
[![Docker](https://img.shields.io/badge/Docker-Containers-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-K8s-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-Message_Queue-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)](https://www.rabbitmq.com/)
[![Apache Kafka](https://img.shields.io/badge/Apache_Kafka-Event_Stream-231F20?style=for-the-badge&logo=apachekafka&logoColor=white)](https://kafka.apache.org/)
[![n8n](https://img.shields.io/badge/n8n-Workflow_Automation-EA4B71?style=for-the-badge&logo=n8n&logoColor=white)](https://n8n.io/)
[![GitHub Actions](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/Aman5ingh19/FixIt/actions)

<p align="center">
  <strong>An Enterprise Distributed Full-Stack Service Booking & Repair Network</strong> with Real-Time WebSockets, Razorpay Payments, RabbitMQ Task Queues with DLQ, Apache Kafka Event Streaming, n8n Automation Workflows, Docker & Kubernetes Orchestration, and Automated GitHub Actions CI/CD.
</p>

🌐 **Live Demo:** [https://fix-it-nu-sable.vercel.app](https://fix-it-nu-sable.vercel.app) &nbsp;|&nbsp; 🖥️ **Backend API:** [https://fixit-dk08.onrender.com](https://fixit-dk08.onrender.com)

</div>

---

## 💡 Engineering Highlights (Why FixIt Stands Out)

- 🛡️ **Role-Based Access Control (RBAC):** Strict multi-tenant security separating Customer, Certified Technician, and Super Admin domains with granular route guards.
- ⚡ **Real-Time WebSocket Engine:** Bidirectional Socket.IO architecture for instant job dispatch, live customer-technician chat, and real-time review alerts.
- 🐇 **RabbitMQ Task Queues & Dead Letter Queues (DLQ):** Resilient asynchronous worker engine with dead-letter exchange (`fixit.dlx`) for transactional email delivery, real-time push dispatches, and webhook forwarding.
- ⚡ **Apache Kafka Distributed Event Streaming (KRaft Mode):** High-throughput event-driven backbone streaming request lifecycle, payment verifications, and audit telemetry (`fixit.request.events`, `fixit.user.events`).
- 🔄 **n8n Workflow Automation Engine:** Automated event-driven webhooks for instant technician onboarding alerts, emergency job escalation, payment receipts sync, and low-rating customer support tickets.
- ☸️ **Cloud-Native Kubernetes & Docker Orchestration:** Production manifests with Horizontal Pod Autoscaling (HPA), Kustomize overlays, multi-stage non-root container builds, and unified Docker Compose environments.
- 🚀 **End-to-End CI/CD Pipeline:** Automated GitHub Actions workflows for linting, database migrations, unit testing with PostgreSQL containers, and multi-arch Docker image packaging.

---

## 🏗️ Architecture & Tech Stack

```text
                               ┌────────────────────────────────────────────────┐
                               │           GitHub Actions CI/CD Pipeline        │
                               │  [1. Lint/Test → 2. Docker Build → 3. K8s CD]  │
                               └───────────────────────┬────────────────────────┘
                                                       │
                                                       ▼
                      ┌──────────────────────────────────────────────────────────┐
                      │              Kubernetes / Docker Compose                 │
                      │                                                          │
                      │   ┌────────────────┐               ┌─────────────────┐   │
                      │   │  React Client  │ ───(HTTP)───► │  Express Server │   │
                      │   │  (Vite+Nginx)  │               │   (REST API)    │   │
                      │   └────────────────┘               └───┬─────────┬───┘   │
                      │                                        │         │       │
                      │        ┌───────────────────────────────┘         │       │
                      │        ▼                                         ▼       │
                      │ ┌──────────────┐                          ┌────────────┐ │
                      │ │   RabbitMQ   │ (Task Queues)            │   Kafka    │ │ (Event Sourcing)
                      │ └──────┬───────┘                          └─────┬──────┘ │
                      │        │                                        │        │
                      │   Async Workers                            Stream Ingest │
                      │  (Email, Push, DLQ)                       (Telemetry/KPI)│
                      │        │                                        │        │
                      │        └──────────────┐        ┌────────────────┘        │
                      │                       ▼        ▼                         │
                      │                 ┌──────────────┐                         │
                      │                 │     n8n      │ (Automation Workflows)  │
                      │                 │  (Webhooks)  │ (Slack, CRM, Sheets)    │
                      │                 └──────────────┘                         │
                      └──────────────────────────────────────────────────────────┘
```

| Layer / Component | Technology / Library | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18, Vite 5, TailwindCSS | High-performance SPA with custom theme tokens & responsive design |
| **Backend REST API** | Node.js 20+, Express.js | Modular Controller-Service-Repository clean architecture |
| **Message Broker (Queues)**| **RabbitMQ 3 (Management + DLQ)** | Asynchronous background workers, email dispatch, notification push & dead-letter queue |
| **Event Streaming** | **Apache Kafka 3.7 (KRaft)** | High-throughput distributed event streaming for order lifecycle & audit streams |
| **Workflow Automation**| **n8n** | Event-driven automation workflows for alerts, escalations, CRM & invoice sync |
| **Containerization** | **Docker & Docker Compose** | Multi-container environment with profiles (`infra`, `app`, `full`) and health checks |
| **Orchestration** | **Kubernetes (K8s) & HPA** | Production Deployments, StatefulSets, Services, Ingress, Autoscalers & Kustomize |
| **CI/CD Pipeline** | **GitHub Actions** | Automated linting, testing with PostgreSQL services, Docker Buildx image packaging |
| **Database** | **Neon PostgreSQL** (Cloud) | Fully managed serverless relational database with pooling |
| **ORM & Migrations** | Prisma ORM | Type-safe models, automated migrations, relational joins & seeding |
| **Authentication** | JWT + bcryptjs (12 rounds) | Short-lived access tokens + rotating refresh tokens in PostgreSQL |
| **Payment Gateway** | **Razorpay SDK** (Sandbox/Live) | Order creation, HMAC-SHA256 signature verification & webhooks |
| **Real-Time Engine** | **Socket.IO** | Room-based chat channels, live typing, and instant status dispatch |
| **Media & CDN** | Multer + Cloudinary | Multi-format image storage (JPEG, PNG, WebP, GIF, SVG, BMP, HEIC) |
| **Caching & Rate Limit** | Redis / Upstash | Distributed session caching & reverse proxy rate limiters |

---

## ⚡ Key Features

### 👤 Customer Experience
- **5-Step Interactive Request Wizard**: Service selection, symptom checklist, multi-source image attachments (Device files, Live Camera, Image URL, Sample breakdown presets), and preferred scheduling.
- **📸 10+ Sample Breakdown Presets**: One-click diagnostic test images for AC leaks, burnt sockets, clogged sinks, cracked screens, circuit trips, etc.
- **Active Job Center**: Filter by `ALL`, `PENDING`, `ACCEPTED`, `COMPLETED` with realtime status updates.
- **Live Chat Modal**: Instant real-time Socket.IO messaging with the assigned technician with persistent chat cache.
- **Service History & Invoices**: Detailed repair receipts, time logs, and technician rating reviews.
- **⭐ Star Rating & Review System**: After a job is completed, customer can leave a 1–5 star rating with a written comment for the technician. Review is displayed on the request detail page and contributes to the technician's live average rating.
- **🔐 Secure Forgot & Reset Password Flow**: Automated transactional password recovery powered by Brevo REST API with single-use 15-minute cryptographically signed tokens.
- **💳 Razorpay Payments**: Pay for completed service requests directly within the app (Test/Sandbox mode with simulated card, UPI & Netbanking).

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
CLIENT_URL=https://fix-it-nu-sable.vercel.app

# Neon PostgreSQL (Cloud Database)
DATABASE_URL="postgresql://neondb_owner:your_password@ep-sample-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&connection_limit=10&pool_timeout=15"
DIRECT_URL="postgresql://neondb_owner:your_password@ep-sample.us-east-2.aws.neon.tech/neondb?sslmode=require"

# JWT Authentication
JWT_ACCESS_SECRET=fixit-dev-access-secret-change-in-production
JWT_REFRESH_SECRET=fixit-dev-refresh-secret-change-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Email (Brevo HTTPS REST API / Gmail SMTP)
BREVO_API_KEY=xkeysib-your_brevo_api_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=appauth.support@gmail.com
SMTP_PASS=your_gmail_app_password
EMAIL_FROM="FixIt Support <appauth.support@gmail.com>"

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
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI/CD Pipeline (Lint, Test, Docker, K8s)
│
├── client/                     # React 18 SPA Frontend
│   ├── public/                 # Static assets & brand favicon
│   ├── src/
│   │   ├── components/         # Common UI (Button, Card, Modal, Badge, ThemeToggle)
│   │   │   ├── chat/           # Real-time Socket.IO ChatPanel
│   │   │   ├── guards/         # ProtectedRoute & RoleGuard
│   │   │   └── layouts/        # DashboardLayout, Sidebar, Topbar, AuthLayout
│   │   ├── contexts/           # AuthContext, SocketContext, LanguageContext
│   │   ├── pages/              # Customer, Technician, Admin, Auth, Landing, Shared
│   │   └── services/           # Axios API clients (auth, request, review, technician, payment)
│   ├── Dockerfile              # Multi-stage production container build
│   ├── nginx.conf              # Production Nginx reverse proxy with SPA rewrites
│   └── package.json
│
├── server/                     # Node.js + Express.js REST API
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema (Users, Requests, TechProfiles, Reviews, Chats)
│   │   └── seed.js             # Initial database seeder
│   ├── src/
│   │   ├── config/             # DB, Redis, RabbitMQ (DLQ), Kafka (KRaft), Socket, Cloudinary
│   │   ├── controllers/        # Auth, Request, Technician, Review, Notification, Upload
│   │   ├── middleware/         # AuthGuard, RBAC, RateLimiter, Security, ErrorHandler
│   │   ├── repositories/       # Prisma query abstraction layer
│   │   ├── routes/             # Express API routes
│   │   ├── services/           # Business logic, Matching, Kafka & RabbitMQ publishers
│   │   ├── workers/            # RabbitMQ async workers (Notifications, Emails, Webhooks, Analytics)
│   │   └── validators/         # Zod request validation schemas
│   ├── Dockerfile              # Multi-stage Node.js Alpine container with non-root security
│   └── package.json
│
├── k8s/                        # Kubernetes Production Manifests
│   ├── client.yaml             # Client Deployment & Service
│   ├── server.yaml             # Server Deployment & Service
│   ├── rabbitmq.yaml           # RabbitMQ StatefulSet & Service
│   ├── kafka.yaml              # Apache Kafka KRaft StatefulSet & Service
│   ├── n8n.yaml                # n8n Workflow Deployment & Service
│   ├── postgres.yaml           # PostgreSQL StatefulSet & PersistentVolume
│   ├── redis.yaml              # Redis StatefulSet & Service
│   ├── hpa.yaml                # Horizontal Pod Autoscalers for Server & Client
│   ├── ingress.yaml            # TLS Ingress routing rules
│   └── kustomization.yaml      # Unified Kustomize bundle
│
├── n8n/
│   └── workflows/              # Ready-to-import visual automation blueprints
│       ├── technician-onboarding-alert.json
│       ├── emergency-escalation.json
│       ├── payment-receipt-sync.json
│       └── low-rating-followup.json
│
├── docker-compose.yml          # Multi-container local orchestration
└── README.md                   # Project documentation
```

---

## 🐳 Running Distributed Services with Docker

```bash
# 1. Start all infrastructure containers (Postgres, Redis, RabbitMQ, Kafka, n8n)
docker compose up -d

# 2. Start the entire platform (including Server & Client)
docker compose --profile full up -d

# 3. View container health & status
docker compose ps

# 4. Stop containers
docker compose down
```

### 🌐 Local Service Dashboards

| Service | Port | Local URL | Credentials |
| :--- | :--- | :--- | :--- |
| **RabbitMQ Management UI** | `15672` | [http://localhost:15672](http://localhost:15672) | `guest` / `guest` |
| **n8n Automation Console** | `5678` | [http://localhost:5678](http://localhost:5678) | `admin` / `admin` |
| **FixIt Client (Docker/Dev)**| `80` / `5173` | [http://localhost:5173](http://localhost:5173) | - |
| **FixIt API Server** | `5000` | [http://localhost:5000/api/health](http://localhost:5000/api/health) | - |
| **Apache Kafka (KRaft)** | `9092` | `localhost:9092` | - |

---

## 📡 Core API Endpoints

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/register` — Register new Customer or Technician account
- `POST /api/auth/login` — Sign in and issue JWT access/refresh tokens
- `POST /api/auth/refresh` — Rotate and issue fresh access token
- `POST /api/auth/logout` — Revoke active session tokens
- `POST /api/auth/forgot-password` — Send 15-minute secure password reset link via Brevo / SMTP
- `POST /api/auth/reset-password` — Validate single-use reset token and set new password
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

## 🎯 Quick Architecture & Tech Summary (Why Each Tool is Used)

| Technology | Role in FixIt Platform |
| :--- | :--- |
| 🐳 **Docker & Compose** | One-command local orchestration (`docker compose up -d`) running all 5 microservices without manual system installs. |
| 🐇 **RabbitMQ + DLQ** | Asynchronous background workers for non-blocking email dispatch, live Socket.IO push alerts, and Dead Letter Queue retry failure isolation. |
| ⚡ **Apache Kafka (KRaft)** | High-throughput distributed event streaming for service request lifecycle, payment verifications, and audit telemetry streams. |
| 🔄 **n8n Workflow Automation** | Low-code event-driven webhook workflows (Technician onboarding alerts, emergency unassigned job escalation, CRM & invoice sync). |
| ☸️ **Kubernetes (K8s)** | Production cloud orchestration with Horizontal Pod Autoscaling (HPA) scaling pods from 2 to 10 instances under heavy load. |
| 🚀 **GitHub Actions CI/CD** | Automated pipeline running unit/integration tests with live PostgreSQL containers and building multi-arch Docker production images on push. |

---

## 👨‍💻 Author & Credits

- **Platform Architect & Developer:** **Aman Singh**
- **GitHub:** [github.com/Aman5ingh19](https://github.com/Aman5ingh19)

- **Designed for:** Scalable, reliable, on-demand home & appliance repair network across India.

---

## 📄 License

This project is open source and available under the **[MIT License](LICENSE)**.
