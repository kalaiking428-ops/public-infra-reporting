const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'infra_issues.sqlite');
const db = new DatabaseSync(dbPath);

// Initialize schema
function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS departments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      head_officer TEXT
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      default_dept_id TEXT,
      icon TEXT
    );

    CREATE TABLE IF NOT EXISTS issues (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category_id TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'Medium',
      status TEXT NOT NULL DEFAULT 'Reported',
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      address TEXT NOT NULL,
      landmark TEXT,
      reporter_name TEXT,
      reporter_email TEXT,
      reporter_phone TEXT,
      image_url TEXT,
      resolution_image_url TEXT,
      department_id TEXT,
      assigned_officer TEXT,
      upvotes INTEGER DEFAULT 1,
      citizen_rating INTEGER,
      citizen_feedback TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories(id),
      FOREIGN KEY (department_id) REFERENCES departments(id)
    );

    CREATE TABLE IF NOT EXISTS timeline (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      issue_id TEXT NOT NULL,
      status TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      actor TEXT DEFAULT 'System',
      created_at TEXT NOT NULL,
      FOREIGN KEY (issue_id) REFERENCES issues(id)
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'citizen',
      department_id TEXT,
      created_at TEXT NOT NULL
    );
  `);

  seedData();
}

function seedData() {
  // Check users
  const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (existingUsers.count === 0) {
    const insertUser = db.prepare('INSERT INTO users (id, name, email, phone, password, role, department_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    const now = new Date().toISOString();
    insertUser.run('USR-ADMIN-1', 'Municipal Control Officer', 'admin@citygov.org', '1800-201-ADMIN', 'admin123', 'admin', 'roads', now);
    insertUser.run('USR-OFFICER-1', 'Inspector M. Rajesh', 'officer@citygov.org', '9840112233', 'officer123', 'officer', 'roads', now);
    insertUser.run('USR-CITIZEN-1', 'Priya Sundaram', 'priya.s@example.com', '9840123456', 'citizen123', 'citizen', null, now);
    insertUser.run('USR-CITIZEN-2', 'Karthik Raman', 'karthik.r@example.com', '9840987654', 'citizen123', 'citizen', null, now);
  }

  // Check if departments exist
  const existingDept = db.prepare('SELECT COUNT(*) as count FROM departments').get();
  if (existingDept.count === 0) {
    const insertDept = db.prepare('INSERT INTO departments (id, name, email, phone, head_officer) VALUES (?, ?, ?, ?, ?)');
    insertDept.run('roads', 'Roads & Infrastructure Maintenance', 'roads@citygov.org', '1800-201-ROAD', 'Eng. Robert Vance');
    insertDept.run('sanitation', 'Sanitation & Solid Waste Management', 'clean@citygov.org', '1800-201-WASTE', 'Officer Sarah Chen');
    insertDept.run('electrical', 'Street Lighting & Electrical Board', 'lighting@citygov.org', '1800-201-LIGHT', 'Chief Tech. David Miller');
    insertDept.run('water', 'Water Supply & Sewerage Board', 'water@citygov.org', '1800-201-WATER', 'Director Ananya Sharma');
    insertDept.run('parks', 'Public Parks & Civic Amenities', 'parks@citygov.org', '1800-201-PARKS', 'Supervisor Marcus Green');
  }

  // Check categories
  const existingCat = db.prepare('SELECT COUNT(*) as count FROM categories').get();
  if (existingCat.count === 0) {
    const insertCat = db.prepare('INSERT INTO categories (id, name, default_dept_id, icon) VALUES (?, ?, ?, ?)');
    insertCat.run('potholes', 'Potholes & Road Damage', 'roads', 'AlertTriangle');
    insertCat.run('streetlights', 'Broken Streetlights', 'electrical', 'Lightbulb');
    insertCat.run('garbage', 'Overflowing Garbage Bin', 'sanitation', 'Trash2');
    insertCat.run('water_drainage', 'Blocked Drain & Water Leakage', 'water', 'Droplets');
    insertCat.run('traffic_signals', 'Damaged Traffic Signs & Signals', 'roads', 'ShieldAlert');
    insertCat.run('public_facilities', 'Damaged Public Facilities & Parks', 'parks', 'Building2');
    insertCat.run('other', 'Other Municipal Issue', 'roads', 'HelpCircle');
  }

  // Check issues
  const existingIssues = db.prepare('SELECT COUNT(*) as count FROM issues').get();
  if (existingIssues.count === 0) {
    const sampleIssues = [
      {
        id: 'INFRA-1001',
        title: 'Deep pothole causing vehicle damage near school zone',
        description: 'Large pothole approximately 2 feet wide and 6 inches deep in the right lane. Poses high risk to two-wheelers and school buses during morning peak hours.',
        category_id: 'potholes',
        priority: 'High',
        status: 'In Progress',
        latitude: 13.0827,
        longitude: 80.2707,
        address: '24 Anna Salai, near St. Thomas Convent',
        landmark: 'Opposite State Bank ATM',
        reporter_name: 'Priya Sundaram',
        reporter_email: 'priya.s@example.com',
        reporter_phone: '9840123456',
        image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
        department_id: 'roads',
        assigned_officer: 'Inspector M. Rajesh',
        upvotes: 14,
        created_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        timeline: [
          { status: 'Reported', title: 'Complaint Registered', description: 'Citizen submitted report with photographic evidence.', actor: 'Citizen (Priya Sundaram)', offsetHours: 36 },
          { status: 'Under Review', title: 'Verified by Municipal Control Room', description: 'Issue inspected remotely and validated for road safety urgency.', actor: 'Civic Triage Desk', offsetHours: 30 },
          { status: 'Assigned', title: 'Assigned to Roads & Infrastructure', description: 'Work order #RD-894 generated and assigned to Inspector M. Rajesh.', actor: 'Central Dispatch', offsetHours: 24 },
          { status: 'In Progress', title: 'Road Repair Crew Dispatched', description: 'Asphalt patching crew scheduled and material dispatched to the site.', actor: 'Inspector M. Rajesh', offsetHours: 4 }
        ]
      },
      {
        id: 'INFRA-1002',
        title: '3 Consecutive Streetlights Dark for over 4 Days',
        description: 'Three sodium vapor streetlamps between pillar 42 and 45 are non-functional, making the stretch completely pitch black at night and unsafe for pedestrians.',
        category_id: 'streetlights',
        priority: 'Critical',
        status: 'Reported',
        latitude: 13.0890,
        longitude: 80.2780,
        address: 'Balfour Road, Kilpauk',
        landmark: 'Near Kilpauk Water Works Gate 2',
        reporter_name: 'Karthik Raman',
        reporter_email: 'karthik.r@example.com',
        reporter_phone: '9840987654',
        image_url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&auto=format&fit=crop&q=80',
        department_id: 'electrical',
        assigned_officer: null,
        upvotes: 9,
        created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        timeline: [
          { status: 'Reported', title: 'Complaint Registered', description: 'Citizen submitted report requesting immediate illumination inspection.', actor: 'Citizen (Karthik Raman)', offsetHours: 12 }
        ]
      },
      {
        id: 'INFRA-1003',
        title: 'Overflowing community garbage container spilling onto roadway',
        description: 'Commercial waste and household garbage overflowing past container borders onto the footpath and street. Attracting stray animals and generating heavy stench.',
        category_id: 'garbage',
        priority: 'Medium',
        status: 'Resolved',
        latitude: 13.0732,
        longitude: 80.2609,
        address: 'Market Lane, Egmore',
        landmark: 'Behind Daily Fresh Vegetable Market',
        reporter_name: 'Deepak Varma',
        reporter_email: 'deepak.v@example.com',
        reporter_phone: '9840555666',
        image_url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&auto=format&fit=crop&q=80',
        resolution_image_url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=80',
        department_id: 'sanitation',
        assigned_officer: 'Officer Sarah Chen',
        upvotes: 21,
        citizen_rating: 5,
        citizen_feedback: 'Prompt clearance and sanitized the surrounding area! Thank you municipal team.',
        created_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
        timeline: [
          { status: 'Reported', title: 'Complaint Registered', description: 'Citizen reported waste overflow near market perimeter.', actor: 'Citizen (Deepak Varma)', offsetHours: 72 },
          { status: 'Assigned', title: 'Forwarded to Zone 5 Sanitation Unit', description: 'Compactor vehicle #CMP-12 routed to Market Lane.', actor: 'Sanitation Dispatch', offsetHours: 48 },
          { status: 'In Progress', title: 'Clearance & Deep Cleaning', description: 'Waste collected, bin washed, and bleaching powder applied.', actor: 'Officer Sarah Chen', offsetHours: 20 },
          { status: 'Resolved', title: 'Site Sanitized & Cleared', description: 'All waste cleared. Bin emptied and restored to designated bay. Proof photo attached.', actor: 'Officer Sarah Chen', offsetHours: 8 }
        ]
      },
      {
        id: 'INFRA-1004',
        title: 'Blocked storm water drain causing street flooding after light rain',
        description: 'Drain inlet is completely clogged with silt and plastic debris. Water accumulation covers the pedestrian walkway and enters storefronts.',
        category_id: 'water_drainage',
        priority: 'High',
        status: 'Reported',
        latitude: 13.0650,
        longitude: 80.2450,
        address: 'Pondy Bazaar Main Road, T. Nagar',
        landmark: 'Opposite Shopping Plaza',
        reporter_name: 'Sneha Jayaraman',
        reporter_email: 'sneha.j@example.com',
        reporter_phone: '9840222333',
        image_url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop&q=80',
        department_id: 'water',
        assigned_officer: null,
        upvotes: 7,
        created_at: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
        timeline: [
          { status: 'Reported', title: 'Complaint Registered', description: 'Citizen reported stormwater overflow and blocked manhole cover.', actor: 'Citizen (Sneha Jayaraman)', offsetHours: 18 }
        ]
      },
      {
        id: 'INFRA-1005',
        title: 'Broken metal swing chains at community children park',
        description: 'The support chain of the toddler swing is severed and has jagged rusted metal exposed. Immediate hazard to neighborhood children.',
        category_id: 'public_facilities',
        priority: 'Medium',
        status: 'In Progress',
        latitude: 13.0950,
        longitude: 80.2180,
        address: 'Boulevard Park, Anna Nagar West',
        landmark: 'Children Play Area Sector 3',
        reporter_name: 'Arun Balaji',
        reporter_email: 'arun.b@example.com',
        reporter_phone: '9840777888',
        image_url: 'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=800&auto=format&fit=crop&q=80',
        department_id: 'parks',
        assigned_officer: 'Supervisor Marcus Green',
        upvotes: 11,
        created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
        timeline: [
          { status: 'Reported', title: 'Complaint Registered', description: 'Parent reported unsafe play equipment.', actor: 'Citizen (Arun Balaji)', offsetHours: 48 },
          { status: 'Under Review', title: 'Safety Audit Conducted', description: 'Park supervisor cordoned off damaged swing pending replacement parts.', actor: 'Parks Dept', offsetHours: 28 },
          { status: 'In Progress', title: 'Heavy-duty Chains Procured', description: 'Technician on-site installing galvanized safety chains.', actor: 'Supervisor Marcus Green', offsetHours: 6 }
        ]
      }
    ];

    const insertIssue = db.prepare(`
      INSERT INTO issues (
        id, title, description, category_id, priority, status,
        latitude, longitude, address, landmark,
        reporter_name, reporter_email, reporter_phone,
        image_url, resolution_image_url, department_id, assigned_officer,
        upvotes, citizen_rating, citizen_feedback, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?
      )
    `);

    const insertTimeline = db.prepare(`
      INSERT INTO timeline (issue_id, status, title, description, actor, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const item of sampleIssues) {
      insertIssue.run(
        item.id, item.title, item.description, item.category_id, item.priority, item.status,
        item.latitude, item.longitude, item.address, item.landmark || null,
        item.reporter_name || 'Anonymous Citizen', item.reporter_email || null, item.reporter_phone || null,
        item.image_url || null, item.resolution_image_url || null, item.department_id || null, item.assigned_officer || null,
        item.upvotes || 1, item.citizen_rating || null, item.citizen_feedback || null,
        item.created_at, item.updated_at
      );

      if (item.timeline && item.timeline.length > 0) {
        for (const ev of item.timeline) {
          const evDate = new Date(Date.now() - (ev.offsetHours || 0) * 3600 * 1000).toISOString();
          insertTimeline.run(item.id, ev.status, ev.title, ev.description || '', ev.actor || 'System', evDate);
        }
      }
    }
  }
}

initDatabase();

module.exports = {
  db,
  generateIssueId: () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `INFRA-${randomNum}`;
  }
};
