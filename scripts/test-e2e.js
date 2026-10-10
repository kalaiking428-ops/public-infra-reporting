/**
 * Automated Smoke Test Suite for CivicAlert Infrastructure System
 */

const { db, generateIssueId } = require('../server/db');

function runTests() {
  console.log('🧪 Starting CivicAlert Automated Smoke Tests...\n');
  let passed = 0;
  let total = 0;

  function assert(testName, condition) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
    }
  }

  // Test 1: Verify Categories
  const categories = db.prepare('SELECT COUNT(*) as count FROM categories').get();
  assert('Categories Table Initialized', categories.count >= 7);

  // Test 2: Verify Departments
  const departments = db.prepare('SELECT COUNT(*) as count FROM departments').get();
  assert('Departments Table Initialized', departments.count >= 5);

  // Test 3: Verify Users Table
  const users = db.prepare('SELECT COUNT(*) as count FROM users').get();
  assert('Users Table Initialized', users.count >= 4);

  // Test 4: Verify Admin Account Exists
  const adminUser = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@citygov.org');
  assert('Admin Account Registered with Correct Role', adminUser && adminUser.role === 'admin');

  // Test 5: Verify Issues Table and Seeding
  const issues = db.prepare('SELECT COUNT(*) as count FROM issues').get();
  assert('Issues Registry Seeded', issues.count >= 5);

  // Test 6: Verify Timeline Events
  const timeline = db.prepare('SELECT COUNT(*) as count FROM timeline').get();
  assert('Timeline Audit Events Recorded', timeline.count >= 5);

  // Test 7: Verify Ticket ID Generator
  const newId = generateIssueId();
  assert('Ticket ID Generator Format (INFRA-XXXX)', /^INFRA-\d{4}$/.test(newId));

  console.log(`\n🎉 Test Results: ${passed}/${total} passed (${Math.round((passed/total)*100)}%)\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

try {
  runTests();
} catch (err) {
  console.error('Fatal error during test run:', err);
  process.exit(1);
}
