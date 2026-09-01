# FixIt — On-Demand Service Request & Repair Network

> 

FixIt is a production-grade, full-stack on-demand home & appliance repair platform connecting customers with background-verified, skilled technicians (electrical, plumbing, HVAC, carpentry, electronics, and appliances) with real-time socket matching, live chat, multi-source photo uploads, and end-to-end job status tracking.

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

---

## ⚡ Key Features

### 👤 Customer Experience
- **5-Step Interactive Request Wizard**: Service selection, symptom checklist, multi-source image attachments (Device files, Live Camera, Image URL, Sample breakdown presets), and preferred scheduling.
- **Active Job Center**: Filter by `ALL`, `PENDING`, `ACCEPTED`, `COMPLETED` with realtime status updates.
- **Live Chat Modal**: Instant real-time Socket.IO messaging with the assigned technician with persistent chat cache.
- **Service History & Invoices**: Detailed repair receipts, time logs, and technician rating reviews.

### 🔧 Technician Workspace
- **Smart Auto-Dispatch**: Direct job allocations for electrical, plumbing, HVAC, appliances, and electronics.
- **Assigned Jobs Manager**: Accept or decline tickets, transition statuses (`Start Job` &rarr; `Mark Complete`), and coordinate live with customers.
- **Earnings & Rating Dashboard**: Live tracking of completed jobs, total revenue (₹10,000+ stat metrics), and client reviews.
- **Custom Trade Avatars**: Profile customization with industry-specific avatars (Electrician, Plumber, HVAC Expert, Appliance Tech, Electronics Pro, Lead Technician).

### 🛡️ Super Admin Control Center
- **KPI Metrics & Analytics**: Total requests, revenue breakdown, technician verification queue, and platform health.
- **Technician Verification**: Government ID & certificate review with one-click approve/reject actions.
- **All Requests Management**: Global override to reassign, inspect, or manage tickets across all cities.
- **Security & Activity Audit**: Detailed audit logs tracking IP addresses, endpoints, timestamps, and user agents.

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
git clone https://github.com/yourusername/FixIt.git
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
│   │   │   ├── admin/          # Dashboard, Technicians, Requests, ActivityLog
│   │   │   ├── auth/           # LoginPage, RegisterPage
│   │   │   ├── customer/       # Dashboard, CreateRequest, ActiveRequests, Detail, History
│   │   │   ├── landing/        # LandingPage
│   │   │   ├── shared/         # AboutPage, HowToUsePage, NotificationsPage, ProfilePage, SettingsPage
│   │   │   └── technician/     # Dashboard, AvailableRequestsPage, AssignedJobsPage
│   │   └── services/           # Axios API clients & WebSocket handlers
│   └── package.json
│
├── server/                     # Node.js + Express.js REST API
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema (Users, Requests, TechProfiles, Reviews, Chats)
│   │   └── seed.js             # Initial database seeder
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
├── docker-compose.yml          # Container orchestration
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

### 🔧 Technician Workflows (`/api/technicians`)
- `GET  /api/technicians/profile` — Fetch technician stats, rating & earnings
- `GET  /api/technicians/assigned` — Fetch active assigned jobs
- `GET  /api/technicians/available` — Fetch nearby open requests for acceptance
- `POST /api/technicians/jobs/:id/accept` — Accept assigned repair ticket
- `POST /api/technicians/jobs/:id/status` — Update job status (`IN_PROGRESS` / `COMPLETED`)

### 💬 Real-Time Live Chat (`/api/requests/:id/messages`)
- `GET  /api/requests/:id/messages` — Fetch message history
- `POST /api/requests/:id/messages` — Send message (also broadcasted over Socket.IO)

---

## 👨‍💻 Author & Credits

- **Platform Architect & Developer:** **Aman Singh**

- **Designed for:** Scalable, reliable, on-demand home & appliance repair network across India.

---

## 📄 License

This project is open source and available under the **[MIT License](LICENSE)**.
