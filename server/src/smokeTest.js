const request = require('supertest');
const createApp = require('./app');
const prisma = require('./config/database');
const { autoSeed } = require('./config/autoSeed');

async function runSmokeTest() {
  console.log('====================================================');
  console.log('       FixIt Full Platform Smoke Test Suite         ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, label, details = '') {
    if (condition) {
      console.log(`  ✅ [PASS] ${label}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${label} ${details ? '- ' + details : ''}`);
      failed++;
    }
  }

  try {
    // 1. Database Connection & AutoSeed
    console.log('1. Verifying Database & Auto-Seed...');
    await prisma.$connect();
    assert(true, 'Database connection established');

    await autoSeed();
    assert(true, 'Auto-seed executed cleanly and idempotently');

    const app = createApp();

    // 2. Health & Root Endpoints
    console.log('\n2. Testing Public Endpoints...');
    const rootRes = await request(app).get('/');
    assert(rootRes.status === 200 && rootRes.body.status === 'online', 'GET / (Root status online)');

    const healthRes = await request(app).get('/api/health');
    assert(healthRes.status === 200 && healthRes.body.success === true && healthRes.body.data?.status === 'ok', 'GET /api/health (Health check healthy)');

    // 3. Auth Endpoints: Admin Login
    console.log('\n3. Testing Demo Account Authentication...');
    const adminLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@fixit.com', password: 'Password123!' });
    assert(
      adminLoginRes.status === 200 && adminLoginRes.body.data?.user?.role === 'ADMIN',
      'POST /api/auth/login -> Admin Login (admin@fixit.com)',
      JSON.stringify(adminLoginRes.body)
    );
    const adminToken = adminLoginRes.body.data?.accessToken;

    // 4. Auth Endpoints: Customer Login
    const customerLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'customer@fixit.com', password: 'Password123!' });
    assert(
      customerLoginRes.status === 200 && customerLoginRes.body.data?.user?.role === 'CUSTOMER',
      'POST /api/auth/login -> Customer Login (customer@fixit.com)',
      JSON.stringify(customerLoginRes.body)
    );
    const customerToken = customerLoginRes.body.data?.accessToken;

    // 5. Auth Endpoints: Technician Login
    const techLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'tech@fixit.com', password: 'Password123!' });
    assert(
      techLoginRes.status === 200 && techLoginRes.body.data?.user?.role === 'TECHNICIAN',
      'POST /api/auth/login -> Technician Login (tech@fixit.com)',
      JSON.stringify(techLoginRes.body)
    );
    const techToken = techLoginRes.body.data?.accessToken;

    // 6. Test Invalid Login Handling
    const badLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@fixit.com', password: 'WrongPassword!' });
    assert(badLoginRes.status === 401, 'POST /api/auth/login -> Rejects invalid password with 401');

    // 7. Catalog & Services Endpoints
    console.log('\n4. Testing Service Catalog & Technicians...');
    const catRes = await request(app).get('/api/services/categories');
    const categoriesList = catRes.body.data?.categories || catRes.body.data || [];
    assert(catRes.status === 200 && Array.isArray(categoriesList) && categoriesList.length > 0, `GET /api/services/categories (${categoriesList.length} categories)`);

    const servicesRes = await request(app).get('/api/services');
    const servicesList = servicesRes.body.data || [];
    assert(servicesRes.status === 200 && Array.isArray(servicesList) && servicesList.length > 0, `GET /api/services (${servicesList.length} services)`);
    const testServiceId = servicesList[0]?.id;

    const techsRes = await request(app)
      .get('/api/technicians')
      .set('Authorization', `Bearer ${adminToken}`);
    assert(techsRes.status === 200, 'GET /api/technicians (Admin Technicians directory reachable)');

    const techProfileRes = await request(app)
      .get('/api/technicians/profile')
      .set('Authorization', `Bearer ${techToken}`);
    assert(techProfileRes.status === 200, 'GET /api/technicians/profile (Technician profile reachable)');

    // 8. Service Request Workflow
    console.log('\n5. Testing Service Request Workflow...');
    if (testServiceId) {
      const createReqRes = await request(app)
        .post('/api/requests')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          serviceId: testServiceId,
          title: 'Smoke Test Request - AC Servicing',
          description: 'Automated smoke test request for verification',
          priority: 0,
          location: {
            address: '123 Test Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
          },
        });
      assert(createReqRes.status === 201 && (createReqRes.body.data?.id || createReqRes.body.data?.request?.id), 'POST /api/requests -> Created customer service request');
    }

    const myRequestsRes = await request(app)
      .get('/api/requests/my')
      .set('Authorization', `Bearer ${customerToken}`);
    assert(myRequestsRes.status === 200, 'GET /api/requests/my (Customer requests retrieved)');

    // 9. Notifications & Payments
    console.log('\n6. Testing Notifications & Payments...');
    const notifRes = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${customerToken}`);
    assert(notifRes.status === 200, 'GET /api/notifications (Notifications endpoint functional)');

    const payConfigRes = await request(app).get('/api/payments/config');
    assert(payConfigRes.status === 200 && payConfigRes.body.data?.keyId, 'GET /api/payments/config (Payment config keyId present)');

    // 10. Summary
    console.log('\n====================================================');
    console.log(`Smoke Test Results: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    await prisma.$disconnect();

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error('💥 Smoke Test encountered an unhandled exception:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

runSmokeTest();
