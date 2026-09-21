import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """Canvas that performs a two-pass calculation to draw 'Page X of Y' and header."""
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_header_footer(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_header_footer(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))

        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 750, "FixIt — Platform Architecture & Working Model Documentation")
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.5)
            self.line(54, 742, 558, 742)

        # Footer (all pages)
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(54, 45, 558, 45)

        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 32, page_str)
        self.drawString(54, 32, "CONFIDENTIAL & PROPRIETARY — FIXIT ENGINEERING SPECIFICATION")
        self.restoreState()


def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=60,
        bottomMargin=55
    )

    styles = getSampleStyleSheet()

    # Custom Color Palette
    PRIMARY = colors.HexColor("#0f172a")      # Slate 900
    SECONDARY = colors.HexColor("#1e40af")    # Blue 800
    ACCENT = colors.HexColor("#0284c7")       # Light Blue 600
    TEXT_DARK = colors.HexColor("#1e293b")    # Slate 800
    TEXT_MUTED = colors.HexColor("#64748b")   # Slate 500
    BG_LIGHT = colors.HexColor("#f8fafc")     # Slate 50
    BORDER_COLOR = colors.HexColor("#e2e8f0") # Slate 200
    CALLOUT_BG = colors.HexColor("#f0f9ff")   # Sky 50
    CALLOUT_BORDER = colors.HexColor("#0284c7")

    # Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=PRIMARY,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=SECONDARY,
        spaceAfter=15
    )

    meta_style = ParagraphStyle(
        'MetaStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=13,
        textColor=TEXT_MUTED,
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'H1Style',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=PRIMARY,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'H2Style',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=SECONDARY,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=TEXT_DARK,
        spaceAfter=6
    )

    body_bold = ParagraphStyle(
        'BodyDarkBold',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    bullet_style = ParagraphStyle(
        'BulletStyle',
        parent=body_style,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=3
    )

    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=TEXT_DARK
    )

    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.white
    )

    callout_style = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#0369a1")
    )

    story = []

    # ─────────────────────────────────────────────────────────────
    # TITLE & HERO HEADER
    # ─────────────────────────────────────────────────────────────
    story.append(Paragraph("FixIt — System Architecture & Working Model", title_style))
    story.append(Paragraph("Enterprise Distributed Full-Stack Service Request & Repair Network", subtitle_style))
    story.append(Paragraph("<b>Version:</b> 1.0.0 &nbsp;|&nbsp; <b>Author:</b> Aman Singh &nbsp;|&nbsp; <b>Status:</b> Production Active &nbsp;|&nbsp; <b>Environment:</b> Multi-Cloud / Kubernetes", meta_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=ACCENT, spaceBefore=0, spaceAfter=12))

    # Executive Overview Callout
    callout_data = [[
        Paragraph(
            "<b>Platform Summary:</b> FixIt is an enterprise-scale on-demand repair and service ecosystem connecting Customers, Certified Technicians, and Super Admins. The system features a 5-step diagnostic request wizard, smart auto-matching, real-time bidirectional Socket.IO chat, Razorpay digital payment processing, RabbitMQ task queues with DLQ, Apache Kafka event streaming (KRaft), n8n workflow automation, and production Kubernetes orchestration.",
            callout_style
        )
    ]]
    callout_table = Table(callout_data, colWidths=[504])
    callout_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), CALLOUT_BG),
        ('BOX', (0, 0), (-1, -1), 1, CALLOUT_BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(callout_table)
    story.append(Spacer(1, 10))

    # ─────────────────────────────────────────────────────────────
    # 1. CORE ARCHITECTURE & TECH STACK
    # ─────────────────────────────────────────────────────────────
    story.append(Paragraph("1. System Architecture & Technology Stack", h1_style))
    story.append(Paragraph(
        "FixIt is architected around a decoupled, micro-service ready layered paradigm. The frontend is a responsive React 18 Single Page Application served via Nginx or Vercel Edge. The backend REST and WebSocket servers are powered by Node.js 20+ Express implementing a Controller-Service-Repository pattern backed by Neon PostgreSQL, Upstash Redis, RabbitMQ task queues, Apache Kafka streaming, and n8n automations.",
        body_style
    ))

    tech_table_data = [
        [Paragraph("Layer", table_header), Paragraph("Technology", table_header), Paragraph("Implementation & Architectural Role", table_header)],
        [Paragraph("<b>Frontend SPA</b>", table_cell), Paragraph("React 18, Vite 5, TailwindCSS", table_cell), Paragraph("Client portal with responsive design tokens, dark/light theme engine, live Socket.IO chat, and 5-step wizard.", table_cell)],
        [Paragraph("<b>REST API Server</b>", table_cell), Paragraph("Node.js 20+, Express.js", table_cell), Paragraph("Modular Controller-Service-Repository architecture with Zod schema validation and RBAC guards.", table_cell)],
        [Paragraph("<b>Relational DB</b>", table_cell), Paragraph("Neon PostgreSQL (Serverless)", table_cell), Paragraph("ACID-compliant storage, connection pooling, automated Prisma migrations, and auto-seeding.", table_cell)],
        [Paragraph("<b>Task Queue & DLQ</b>", table_cell), Paragraph("RabbitMQ 3 (Management)", table_cell), Paragraph("Asynchronous worker queues (emails, notifications, webhooks) with Dead Letter Exchange (fixit.dlx).", table_cell)],
        [Paragraph("<b>Event Streaming</b>", table_cell), Paragraph("Apache Kafka 3.7 (KRaft)", table_cell), Paragraph("Distributed log for request lifecycle, audit telemetry, and real-time streaming without Zookeeper.", table_cell)],
        [Paragraph("<b>Workflow Engine</b>", table_cell), Paragraph("n8n Low-Code Workflows", table_cell), Paragraph("Event-driven webhook automations: Onboarding alerts, emergency escalation, invoice & CRM sync.", table_cell)],
        [Paragraph("<b>Payment Gateway</b>", table_cell), Paragraph("Razorpay SDK (Test/Live)", table_cell), Paragraph("Server-side order generation, HMAC-SHA256 signature verification, and async webhook handlers.", table_cell)],
        [Paragraph("<b>Real-Time Engine</b>", table_cell), Paragraph("Socket.IO + JWT", table_cell), Paragraph("Multiplexed WebSocket channels with room routing (user, role, and chat:requestId).", table_cell)],
        [Paragraph("<b>Cloud / DevOps</b>", table_cell), Paragraph("Docker, K8s, GitHub Actions", table_cell), Paragraph("Multi-stage non-root containers, Horizontal Pod Autoscaling (HPA 2-10 pods), and CI/CD pipelines.", table_cell)],
    ]
    t1 = Table(tech_table_data, colWidths=[90, 134, 280])
    t1.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
    ]))
    story.append(t1)
    story.append(Spacer(1, 10))

    # ─────────────────────────────────────────────────────────────
    # 2. DATABASE SCHEMA & DATA MODELS
    # ─────────────────────────────────────────────────────────────
    story.append(Paragraph("2. Database Schema & Data Models", h1_style))
    story.append(Paragraph(
        "The relational schema is managed via Prisma ORM and contains 13 models mapped with rigorous foreign key constraints and performance indexes:",
        body_style
    ))

    schema_data = [
        [Paragraph("Model", table_header), Paragraph("Primary Fields", table_header), Paragraph("Relationships & Constraints", table_header)],
        [Paragraph("<b>User</b>", table_cell), Paragraph("id, email, passwordHash, role (CUSTOMER, TECHNICIAN, ADMIN), isActive, emailVerified", table_cell), Paragraph("1-to-1 with TechnicianProfile; 1-to-Many with ServiceRequests, Notifications, Messages, Tokens.", table_cell)],
        [Paragraph("<b>TechnicianProfile</b>", table_cell), Paragraph("id, userId, bio, experienceYears, verificationStatus, availability, averageRating, totalEarnings", table_cell), Paragraph("Belongs to User; 1-to-Many with TechnicianService, ServiceArea, and RequestAssignment.", table_cell)],
        [Paragraph("<b>ServiceRequest</b>", table_cell), Paragraph("id, customerId, serviceId, title, description, status (PENDING..COMPLETED..CANCELLED), priority", table_cell), Paragraph("Belongs to User & Service; 1-to-1 with Location, Review, Payment; 1-to-Many Images, Messages.", table_cell)],
        [Paragraph("<b>ServiceLocation</b>", table_cell), Paragraph("id, requestId, address, city, state, zipCode, latitude, longitude", table_cell), Paragraph("1-to-1 unique mapping to ServiceRequest.", table_cell)],
        [Paragraph("<b>RequestImage</b>", table_cell), Paragraph("id, requestId, imageUrl, publicId, caption", table_cell), Paragraph("1-to-Many attachments per ServiceRequest.", table_cell)],
        [Paragraph("<b>RequestAssignment</b>", table_cell), Paragraph("id, requestId, technicianId, status (PENDING, ACCEPTED, REJECTED), assignedAt", table_cell), Paragraph("Join model linking ServiceRequest to matched TechnicianProfiles.", table_cell)],
        [Paragraph("<b>Message</b>", table_cell), Paragraph("id, requestId, senderId, receiverId, content, isRead, createdAt", table_cell), Paragraph("Stores bidirectional chat history linked to request & sender/receiver users.", table_cell)],
        [Paragraph("<b>Payment</b>", table_cell), Paragraph("id, requestId, amount, status (PENDING, PAID, FAILED), razorpayOrderId, razorpayPaymentId, signature", table_cell), Paragraph("1-to-1 payment ledger linked to ServiceRequest with cryptographic validation data.", table_cell)],
        [Paragraph("<b>Review</b>", table_cell), Paragraph("id, requestId, authorId, subjectId, rating (1-5), comment", table_cell), Paragraph("Customer feedback linked to request; updates technician average rating dynamically.", table_cell)],
        [Paragraph("<b>ActivityLog</b>", table_cell), Paragraph("id, userId, action, entity, entityId, details, ipAddress, createdAt", table_cell), Paragraph("Immutable platform audit log for security telemetry and admin inspection.", table_cell)],
    ]
    t2 = Table(schema_data, colWidths=[100, 184, 220])
    t2.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
    ]))
    story.append(t2)
    story.append(Spacer(1, 10))

    # ─────────────────────────────────────────────────────────────
    # 3. END-TO-END WORKING MODEL & PERSONA WORKFLOWS
    # ─────────────────────────────────────────────────────────────
    story.append(Paragraph("3. End-to-End Working Model & Persona Journeys", h1_style))
    story.append(Paragraph("The platform orchestrates state transitions and real-time events across three core personas:", body_style))

    story.append(Paragraph("A. Customer Lifecycle Flow", h2_style))
    story.append(Paragraph("• <b>Authentication:</b> Sign up or instant demo login with dual JWT access/refresh token rotation.", bullet_style))
    story.append(Paragraph("• <b>5-Step Booking Wizard:</b> Category selection &rarr; Service & base pricing &rarr; Symptom checklist & description &rarr; Visual attachments (Camera/File/Presets) &rarr; Location & scheduling.", bullet_style))
    story.append(Paragraph("• <b>Smart Dispatch:</b> Request moves to <code>MATCHING</code>. Server auto-identifies eligible certified technicians in the city and notifies them via WebSockets & RabbitMQ.", bullet_style))
    story.append(Paragraph("• <b>Live Interaction:</b> Status updates to <code>ACCEPTED</code> upon technician claim. Customer joins real-time Socket.IO chat room with typing indicators.", bullet_style))
    story.append(Paragraph("• <b>Execution & Payment:</b> Technician updates status to <code>IN_PROGRESS</code> &rarr; <code>COMPLETED</code>. Customer initiates one-click Razorpay payment (UPI, Card, Netbanking).", bullet_style))
    story.append(Paragraph("• <b>Review Submission:</b> Customer submits 1–5 star rating and comment, automatically recalculating technician's public rating metrics.", bullet_style))

    story.append(Paragraph("B. Technician Workspace Flow", h2_style))
    story.append(Paragraph("• <b>Onboarding & Verification:</b> Technician registers trade specialties, years of experience, ID cards, and certifications. Awaits admin approval (<code>PENDING</code> &rarr; <code>APPROVED</code>).", bullet_style))
    story.append(Paragraph("• <b>Availability Management:</b> Technician toggles availability switch (<code>ONLINE</code>, <code>OFFLINE</code>, <code>BUSY</code>).", bullet_style))
    story.append(Paragraph("• <b>Job Dispatch Management:</b> Live incoming request alerts appear on technician dashboard. Technician can inspect diagnostic photos and accept or decline.", bullet_style))
    story.append(Paragraph("• <b>Job Progress Lifecycle:</b> Technician transitions request through <code>ACCEPTED</code> &rarr; <code>IN_PROGRESS</code> &rarr; <code>COMPLETED</code>.", bullet_style))
    story.append(Paragraph("• <b>Earnings & Performance:</b> Live dashboard displays total completed jobs, total revenue (INR), and review breakdown.", bullet_style))

    story.append(Paragraph("C. Super Administrator Control Center", h2_style))
    story.append(Paragraph("• <b>KPI Metrics:</b> Platform-wide real-time revenue, booking volume, technician utilization, and completion rates.", bullet_style))
    story.append(Paragraph("• <b>Technician Verification Queue:</b> Government ID and certificate inspection with 1-click Approve/Reject actions (triggers automated n8n onboarding email).", bullet_style))
    story.append(Paragraph("• <b>Global Ticket & Chat Audit:</b> Inspect any active or historical request across India with full timeline, payment record, and customer-technician chat logs.", bullet_style))
    story.append(Paragraph("• <b>Security & Activity Logs:</b> Audit trail capturing user actions, IP addresses, endpoint calls, and timestamps.", bullet_style))
    story.append(Spacer(1, 10))

    # ─────────────────────────────────────────────────────────────
    # 4. ASYNCHRONOUS EVENT STREAMING & AUTOMATION
    # ─────────────────────────────────────────────────────────────
    story.append(Paragraph("4. Asynchronous Task Queues, Kafka & n8n Automation", h1_style))
    story.append(Paragraph(
        "To ensure zero-blocking HTTP request cycles, asynchronous operations are segregated into message queues and distributed event streams:",
        body_style
    ))

    async_data = [
        [Paragraph("Subsystem", table_header), Paragraph("Queue / Topic / Blueprint", table_header), Paragraph("Function & Error Resilience", table_header)],
        [Paragraph("<b>RabbitMQ Tasks</b>", table_cell), Paragraph("<code>fixit.notifications</code><br/><code>fixit.emails</code><br/><code>fixit.webhooks</code><br/><code>fixit.analytics</code>", table_cell), Paragraph("Dispatches asynchronous in-app notifications, transactional Brevo emails, and telemetry. Failures route to Dead Letter Exchange (<code>fixit.dlx</code>) & <code>fixit.dead_letter</code>.", table_cell)],
        [Paragraph("<b>Kafka Streaming</b>", table_cell), Paragraph("<code>fixit.request.events</code><br/><code>fixit.user.events</code><br/><code>fixit.analytics.events</code>", table_cell), Paragraph("High-throughput distributed event broker operating in KRaft mode (no Zookeeper). Produces immutable order lifecycle events for telemetry & audit.", table_cell)],
        [Paragraph("<b>n8n Automation</b>", table_cell), Paragraph("<code>technician-onboarding-alert</code><br/><code>emergency-escalation</code><br/><code>payment-receipt-sync</code><br/><code>low-rating-followup</code>", table_cell), Paragraph("Visual low-code automation blueprints: Sends onboarding emails, escalates urgent unattended requests, syncs receipts to sheets, and creates support tickets for ratings &le; 2.", table_cell)],
    ]
    t3 = Table(async_data, colWidths=[110, 160, 234])
    t3.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
    ]))
    story.append(t3)
    story.append(Spacer(1, 10))

    # ─────────────────────────────────────────────────────────────
    # 5. PAYMENT GATEWAY (RAZORPAY INTEGRATION)
    # ─────────────────────────────────────────────────────────────
    story.append(Paragraph("5. Razorpay Payment Gateway & Cryptographic Verification", h1_style))
    story.append(Paragraph(
        "FixIt embeds a production-grade Razorpay payment integration with server-side price calculations and cryptographic HMAC-SHA256 signature verification:",
        body_style
    ))
    story.append(Paragraph("1. <b>Order Creation:</b> Client requests order &rarr; Express server fetches base price from DB &rarr; Calls <code>razorpay.orders.create({ amount, currency: 'INR' })</code> &rarr; Stores order ID in <code>payments</code> table with status <code>PENDING</code>.", bullet_style))
    story.append(Paragraph("2. <b>Client Checkout:</b> Razorpay modal opens with simulated card, UPI (<code>success@razorpay</code>), or Netbanking options in Sandbox mode (or live bank payment in Production).", bullet_style))
    story.append(Paragraph("3. <b>Signature Verification:</b> Client posts <code>razorpay_order_id</code>, <code>razorpay_payment_id</code>, and <code>razorpay_signature</code>. Server computes <code>crypto.createHmac('sha256', secret).update(orderId + '|' + paymentId).digest('hex')</code>. If matched, status updates to <code>PAID</code>.", bullet_style))
    story.append(Paragraph("4. <b>Webhooks Ingestion:</b> Asynchronous webhook handler processes <code>payment.captured</code> and <code>payment.failed</code> events to reconcile asynchronous bank settlements.", bullet_style))
    story.append(Spacer(1, 10))

    # ─────────────────────────────────────────────────────────────
    # 6. DEVOPS, KUBERNETES & CLOUD DEPLOYMENT
    # ─────────────────────────────────────────────────────────────
    story.append(Paragraph("6. Containerization, Kubernetes & CI/CD Pipeline", h1_style))
    story.append(Paragraph(
        "The application is engineered for cloud-native deployment with Docker Compose, Kubernetes, and GitHub Actions:",
        body_style
    ))
    story.append(Paragraph("• <b>Docker Compose:</b> Orchestrates 7 microservices (<code>postgres</code>, <code>redis</code>, <code>rabbitmq</code>, <code>kafka</code>, <code>n8n</code>, <code>fixit-server</code>, <code>fixit-client</code>) with health check dependencies and profile partitioning.", bullet_style))
    story.append(Paragraph("• <b>Kubernetes (K8s):</b> Production manifests in <code>/k8s</code> include StatefulSets for PostgreSQL, Redis, RabbitMQ, and Kafka; Deployments for Server and Client; and Ingress with TLS termination.", bullet_style))
    story.append(Paragraph("• <b>Horizontal Pod Autoscaler (HPA):</b> Automatically scales API server pods between 2 and 10 replicas based on real-time CPU (>70%) and Memory (>80%) consumption.", bullet_style))
    story.append(Paragraph("• <b>GitHub Actions CI/CD:</b> Automated pipeline runs ESLint, spins up a live PostgreSQL test container for Prisma migrations and API smoke tests, and packages multi-architecture Docker images.", bullet_style))
    story.append(Spacer(1, 10))

    # ─────────────────────────────────────────────────────────────
    # 7. SECURITY, AUTH & FAULT TOLERANCE
    # ─────────────────────────────────────────────────────────────
    story.append(Paragraph("7. Security Hardening & Resilience Engineering", h1_style))
    story.append(Paragraph("• <b>Dual-Token JWT Security:</b> 15-minute access tokens + 7-day rotating refresh tokens stored hashed in DB.", bullet_style))
    story.append(Paragraph("• <b>Password Security:</b> 12-round bcrypt hash + single-use 15-minute cryptographically signed reset tokens.", bullet_style))
    story.append(Paragraph("• <b>Non-Blocking Messaging Resilience:</b> If Kafka or RabbitMQ is unavailable during cold startup, the REST server logs a warning and proceeds with database operations without dropping user requests.", bullet_style))
    story.append(Paragraph("• <b>Auto-Seeding Mechanism:</b> On cold boot, the server checks if database tables are populated; if empty, it automatically runs seeds for categories, services, and default demo accounts.", bullet_style))
    story.append(Spacer(1, 14))

    # Sign-off box
    signoff_data = [[
        Paragraph(
            "<b>FixIt Engineering Specification</b> &nbsp;|&nbsp; Designed & Maintained by <b>Aman Singh</b> &nbsp;|&nbsp; Repository: <font color='#0284c7'>github.com/Aman5ingh19/FixIt</font>",
            meta_style
        )
    ]]
    signoff_table = Table(signoff_data, colWidths=[504])
    signoff_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), BG_LIGHT),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ]))
    story.append(signoff_table)

    # Build Document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"[SUCCESS] PDF successfully generated at: {filename}")

if __name__ == '__main__':
    output_path = os.path.join(os.getcwd(), "FixIt_System_Architecture_and_Working_Model_Documentation.pdf")
    build_pdf(output_path)
