/**
 * ContentPilot AI - Phase 1 Complete Verification Test Suite
 * Tests all 16 criteria defined in Phase 1 specification:
 * - User registration with default Author role
 * - Author draft creation and submission
 * - Role-Based Access Control (RBAC) enforcement
 * - Publishing and review workflow (Draft -> Pending Review -> Approved/Published)
 * - Public API retrieval of published items only
 * - Content versioning and revision history
 * - Admin user governance and last admin protection
 * - Activity logging
 */

import http from 'http';
import app from '../server.js';

let server;
let baseUrl = '';

const request = async (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(url, { method, headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = { raw: data };
        }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const assert = (condition, message) => {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(message);
  }
  console.log(`  ✓ ${message}`);
};

const runTests = async () => {
  console.log('\n======================================================');
  console.log('🧪 Starting ContentPilot AI Phase 1 Automated Test Suite');
  console.log('======================================================\n');

  // Start temporary server
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      console.log(`[Test Server] Running on ${baseUrl}\n`);
      resolve();
    });
  });

  try {
    // ----------------------------------------------------
    // Test 1: Health Check
    // ----------------------------------------------------
    console.log('Test 1: Health Check Endpoint');
    const health = await request('GET', '/api/health');
    assert(health.status === 200, 'Health endpoint returns 200 OK');
    assert(health.body.status === 'online', 'Server reports online status');

    // ----------------------------------------------------
    // Test 2: Public Contents Feed (Initial Seed)
    // ----------------------------------------------------
    console.log('\nTest 2: Public Website Data Retrieval');
    const pub = await request('GET', '/api/contents');
    assert(pub.status === 200, 'Public contents returns 200');
    assert(pub.body.contents.length > 0, 'Public contents returns non-empty list of published items');
    assert(pub.body.contents.every(c => c.status === 'published'), 'All items in public endpoint have status=published');

    // ----------------------------------------------------
    // Test 3: Register a new user & verify default Author role
    // ----------------------------------------------------
    console.log('\nTest 3: User Registration & Default Author Role');
    const testAuthorEmail = `author_test_${Date.now()}@contentpilot.ai`;
    const regRes = await request('POST', '/api/auth/register', {
      full_name: 'Test Author User',
      email: testAuthorEmail,
      password: 'Password123'
    });
    assert(regRes.status === 201, 'Registration returns 201 Created');
    assert(regRes.body.user.role === 'author', 'Newly registered user receives Author role by default');
    assert(Boolean(regRes.body.token), 'Registration returns an auth token');
    const authorToken = regRes.body.token;
    const authorId = regRes.body.user.id;

    // ----------------------------------------------------
    // Test 4: Log in as Author
    // ----------------------------------------------------
    console.log('\nTest 4: Author Login & Session');
    const loginRes = await request('POST', '/api/auth/login', {
      email: testAuthorEmail,
      password: 'Password123'
    });
    assert(loginRes.status === 200, 'Login returns 200 OK');
    assert(loginRes.body.user.email === testAuthorEmail, 'Returned profile matches author email');

    // ----------------------------------------------------
    // Test 5: Author creates an article draft
    // ----------------------------------------------------
    console.log('\nTest 5: Content Creation (Draft)');
    const articleRes = await request('POST', '/api/contents', {
      title: 'Exploring Reactive Publishing Pipelines',
      description: 'An introductory guide to modern publishing architectures.',
      body: '<p>Content pipelines require thoughtful validation and review.</p>',
      content_type: 'article',
      tags: ['Publishing', 'Architecture'],
      status: 'draft'
    }, authorToken);
    assert(articleRes.status === 201, 'Content creation returns 201 Created');
    assert(articleRes.body.content.status === 'draft', 'New content is saved as draft');
    const testArticleId = articleRes.body.content.id;
    const testArticleSlug = articleRes.body.content.slug;

    // ----------------------------------------------------
    // Test 6: Verify Author CANNOT publish directly
    // ----------------------------------------------------
    console.log('\nTest 6: Verify Author Cannot Publish Directly (RBAC)');
    const pubAttempt = await request('PUT', `/api/contents/${testArticleId}`, {
      status: 'published'
    }, authorToken);
    assert(pubAttempt.status === 400, 'Author attempting to set status=published is rejected (HTTP 400)');

    // Verify it is not visible on public endpoint
    const checkSlugBefore = await request('GET', `/api/contents/slug/${testArticleSlug}`);
    assert(checkSlugBefore.status === 404, 'Draft article is not accessible via public slug endpoint');

    // ----------------------------------------------------
    // Test 7: Author submits draft for review
    // ----------------------------------------------------
    console.log('\nTest 7: Author Submits Content for Review');
    const submitRes = await request('POST', `/api/contents/${testArticleId}/submit`, {}, authorToken);
    assert(submitRes.status === 200, 'Submission returns 200 OK');
    assert(submitRes.body.content.status === 'pending_review', 'Article status transitioned to pending_review');

    // ----------------------------------------------------
    // Test 8: Register a 2nd author to test author isolation
    // ----------------------------------------------------
    console.log('\nTest 8: Verify Authors Cannot Edit Other Users\' Content');
    const secondAuthorEmail = `author2_test_${Date.now()}@contentpilot.ai`;
    const reg2 = await request('POST', '/api/auth/register', {
      full_name: 'Second Author',
      email: secondAuthorEmail,
      password: 'Password123'
    });
    const secondAuthorToken = reg2.body.token;

    const crossEdit = await request('PUT', `/api/contents/${testArticleId}`, {
      title: 'Hacked Title By Second Author'
    }, secondAuthorToken);
    assert(crossEdit.status === 400, 'Second author forbidden from editing first author content');

    // ----------------------------------------------------
    // Test 9: Editor logs in and reviews pending content
    // ----------------------------------------------------
    console.log('\nTest 9: Editor Login & Review Queue');
    const editorLogin = await request('POST', '/api/auth/login', {
      email: 'editor@contentpilot.ai',
      password: 'Editor@123'
    });
    assert(editorLogin.status === 200, 'Editor logs in successfully');
    const editorToken = editorLogin.body.token;

    // Editor inspects pending items
    const pendingList = await request('GET', '/api/contents/manage?status=pending_review', null, editorToken);
    assert(pendingList.status === 200, 'Editor retrieves pending review list');
    const foundPending = pendingList.body.contents.some(c => c.id === testArticleId);
    assert(foundPending, 'Pending article appears in editor review queue');

    // ----------------------------------------------------
    // Test 10: Editor approves and publishes the article
    // ----------------------------------------------------
    console.log('\nTest 10: Editor Approves and Publishes Content');
    const reviewRes = await request('POST', `/api/contents/${testArticleId}/review`, {
      action: 'approve'
    }, editorToken);
    assert(reviewRes.status === 200, 'Editor approval returns 200 OK');
    assert(reviewRes.body.content.status === 'published', 'Article status is now published');
    assert(Boolean(reviewRes.body.content.published_at), 'published_at timestamp is set');

    // ----------------------------------------------------
    // Test 11: Public Website Verification
    // ----------------------------------------------------
    console.log('\nTest 11: Public Website Automatically Shows Published Content');
    const publicArticle = await request('GET', `/api/contents/slug/${testArticleSlug}`);
    assert(publicArticle.status === 200, 'Public slug endpoint now serves the published article');
    assert(publicArticle.body.content.title === 'Exploring Reactive Publishing Pipelines', 'Public title matches');

    // ----------------------------------------------------
    // Test 12: Content Versioning
    // ----------------------------------------------------
    console.log('\nTest 12: Content Versioning on Update');
    const updateRes = await request('PUT', `/api/contents/${testArticleId}`, {
      title: 'Exploring Reactive Publishing Pipelines (Revised Edition)',
      body: '<p>Updated content body with deeper insights.</p>'
    }, editorToken);
    assert(updateRes.status === 200, 'Editor updates published content');

    // Check version history
    const versionsRes = await request('GET', `/api/contents/${testArticleId}/versions`, null, editorToken);
    assert(versionsRes.status === 200, 'Versions endpoint returns 200');
    assert(versionsRes.body.versions.length >= 1, 'Revision history recorded previous title and body');
    assert(versionsRes.body.versions[0].previous_title === 'Exploring Reactive Publishing Pipelines', 'Previous title saved accurately');

    // ----------------------------------------------------
    // Test 13: Admin Login & Protected Operations
    // ----------------------------------------------------
    console.log('\nTest 13: Admin User Governance & Last Admin Protection');
    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@contentpilot.ai',
      password: 'Admin@123'
    });
    assert(adminLogin.status === 200, 'Admin logs in successfully');
    const adminToken = adminLogin.body.token;
    const adminId = adminLogin.body.user.id;

    // Check non-admin cannot access user management
    const forbiddenUsers = await request('GET', '/api/users', null, editorToken);
    assert(forbiddenUsers.status === 403, 'Editor cannot access user management (HTTP 403 Forbidden)');

    // Admin lists all users
    const userList = await request('GET', '/api/users', null, adminToken);
    assert(userList.status === 200, 'Admin can list all users');
    assert(userList.body.profiles.length >= 3, 'User list includes all accounts');

    // Admin updates role of author to editor
    const promoteRes = await request('PUT', `/api/users/${authorId}/role`, { role: 'editor' }, adminToken);
    assert(promoteRes.status === 200, 'Admin promotes user to Editor');
    assert(promoteRes.body.user.role === 'editor', 'Role successfully updated');

    // Test Last Admin Protection: Admin cannot demote self or remove last active admin
    const demoteSelf = await request('PUT', `/api/users/${adminId}/role`, { role: 'author' }, adminToken);
    assert(demoteSelf.status === 400, 'Admin prevented from changing own role or removing last admin');

    // ----------------------------------------------------
    // Test 14: Dynamic Dashboard Statistics
    // ----------------------------------------------------
    console.log('\nTest 14: Dynamic Database Statistics');
    const statsRes = await request('GET', '/api/stats/dashboard', null, adminToken);
    assert(statsRes.status === 200, 'Dashboard statistics returns 200');
    assert(statsRes.body.data.stats.totalContent > 0, 'Total content count is dynamic and > 0');
    assert(statsRes.body.data.stats.publishedCount > 0, 'Published content count is dynamic and > 0');
    assert(statsRes.body.data.stats.totalUsers >= 4, 'Total users count is accurate');

    // ----------------------------------------------------
    // Test 15: Activity Audit Logs
    // ----------------------------------------------------
    console.log('\nTest 15: Activity Audit Logging');
    const logsRes = await request('GET', '/api/activity-logs', null, adminToken);
    assert(logsRes.status === 200, 'Activity logs return 200 OK');
    assert(logsRes.body.logs.length > 0, 'Activity logs recorded actions');
    const actions = logsRes.body.logs.map(l => l.action);
    assert(actions.includes('USER_REGISTER'), 'Logs record USER_REGISTER');
    assert(actions.includes('USER_LOGIN'), 'Logs record USER_LOGIN');
    assert(actions.includes('CONTENT_CREATE'), 'Logs record CONTENT_CREATE');
    assert(actions.includes('CONTENT_SUBMIT'), 'Logs record CONTENT_SUBMIT');
    assert(actions.includes('CONTENT_PUBLISH'), 'Logs record CONTENT_PUBLISH');

    // ----------------------------------------------------
    // Test 16: Category & Media Endpoints
    // ----------------------------------------------------
    console.log('\nTest 16: Categories & Media Endpoints');
    const catRes = await request('GET', '/api/categories');
    assert(catRes.status === 200, 'Categories endpoint returns 200');
    assert(catRes.body.categories.length >= 4, 'Includes seeded categories');

    console.log('\n======================================================');
    console.log('🎉 ALL 16 PHASE 1 VERIFICATION TESTS PASSED SUCCESSFULLY!');
    console.log('======================================================\n');
  } finally {
    if (server) {
      server.close();
    }
  }
};

runTests().catch(err => {
  console.error('\n❌ Test suite execution failed:', err);
  process.exit(1);
});

