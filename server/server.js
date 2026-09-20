const express = require('express');
const cors = require('cors');
const path = require('node:path');
const fs = require('node:fs');
const multer = require('multer');
const { db, generateIssueId } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uploads directory
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, 'evidence-' + uniqueSuffix + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// Helper to format an issue with joined info
function formatIssue(row) {
  return {
    ...row,
    upvotes: row.upvotes || 0,
    latitude: parseFloat(row.latitude),
    longitude: parseFloat(row.longitude)
  };
}

// -------------------------------------------------------------
// AUTHENTICATION ROUTES
// -------------------------------------------------------------
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, phone, password, role = 'citizen' } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get(cleanEmail);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
    }

    const id = 'USR-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (id, name, email, phone, password, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, name.trim(), cleanEmail, phone ? phone.trim() : null, password, role, now);

    const user = {
      id,
      name: name.trim(),
      email: cleanEmail,
      phone: phone ? phone.trim() : null,
      role
    };

    res.status(201).json({
      message: 'Account created successfully!',
      user,
      token: 'session-' + id
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(cleanEmail);

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password. Please check your credentials.' });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      department_id: user.department_id
    };

    res.json({
      message: 'Login successful!',
      user: safeUser,
      token: 'session-' + user.id
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', (req, res) => {
  try {
    const email = req.query.email;
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }
    const user = db.prepare('SELECT id, name, email, phone, role, department_id FROM users WHERE LOWER(email) = ?').get(email.trim().toLowerCase());
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.get('/api/issues/my', (req, res) => {
  try {
    const email = req.query.email;
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    const issues = db.prepare(`
      SELECT i.*, c.name as category_name, c.icon as category_icon, d.name as department_name
      FROM issues i
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN departments d ON i.department_id = d.id
      WHERE LOWER(i.reporter_email) = ?
      ORDER BY i.created_at DESC
    `).all(email.trim().toLowerCase()).map(formatIssue);

    res.json(issues);
  } catch (err) {
    console.error('Error fetching user issues:', err);
    res.status(500).json({ error: 'Failed to fetch user issues' });
  }
});

// -------------------------------------------------------------
// 1. GET /api/categories - list all categories
// -------------------------------------------------------------
app.get('/api/categories', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories').all();
    res.json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// -------------------------------------------------------------
// 2. GET /api/departments - list all departments with counts
// -------------------------------------------------------------
app.get('/api/departments', (req, res) => {
  try {
    const departments = db.prepare(`
      SELECT d.*, 
        (SELECT COUNT(*) FROM issues WHERE department_id = d.id AND status != 'Resolved' AND status != 'Rejected') as active_issues_count,
        (SELECT COUNT(*) FROM issues WHERE department_id = d.id AND status = 'Resolved') as resolved_issues_count
      FROM departments d
    `).all();
    res.json(departments);
  } catch (err) {
    console.error('Error fetching departments:', err);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// -------------------------------------------------------------
// 3. GET /api/issues - list with optional filters
// -------------------------------------------------------------
app.get('/api/issues', (req, res) => {
  try {
    const { status, category_id, department_id, priority, search } = req.query;
    let query = `
      SELECT i.*, c.name as category_name, c.icon as category_icon, d.name as department_name
      FROM issues i
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN departments d ON i.department_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      query += ' AND i.status = ?';
      params.push(status);
    }
    if (category_id && category_id !== 'all') {
      query += ' AND i.category_id = ?';
      params.push(category_id);
    }
    if (department_id && department_id !== 'all') {
      query += ' AND i.department_id = ?';
      params.push(department_id);
    }
    if (priority && priority !== 'all') {
      query += ' AND i.priority = ?';
      params.push(priority);
    }
    if (search && search.trim()) {
      query += ' AND (i.id LIKE ? OR i.title LIKE ? OR i.description LIKE ? OR i.address LIKE ?)';
      const s = `%${search.trim()}%`;
      params.push(s, s, s, s);
    }

    query += ` ORDER BY CASE i.priority WHEN 'Critical' THEN 1 WHEN 'High' THEN 2 WHEN 'Medium' THEN 3 ELSE 4 END, i.created_at DESC`;

    const issues = db.prepare(query).all(...params).map(formatIssue);
    res.json(issues);
  } catch (err) {
    console.error('Error fetching issues:', err);
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
});

// -------------------------------------------------------------
// 4. GET /api/issues/:id - get single issue with full timeline
// -------------------------------------------------------------
app.get('/api/issues/:id', (req, res) => {
  try {
    const issueId = req.params.id.toUpperCase();
    const issue = db.prepare(`
      SELECT i.*, c.name as category_name, c.icon as category_icon, d.name as department_name
      FROM issues i
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN departments d ON i.department_id = d.id
      WHERE UPPER(i.id) = ?
    `).get(issueId);

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found with ID: ' + issueId });
    }

    const timeline = db.prepare(`
      SELECT * FROM timeline 
      WHERE issue_id = ? 
      ORDER BY created_at ASC, id ASC
    `).all(issue.id);

    res.json({
      ...formatIssue(issue),
      timeline
    });
  } catch (err) {
    console.error('Error fetching issue:', err);
    res.status(500).json({ error: 'Failed to fetch issue details' });
  }
});

// -------------------------------------------------------------
// 5. POST /api/issues - create a new complaint
// -------------------------------------------------------------
app.post('/api/issues', upload.single('image'), (req, res) => {
  try {
    const {
      title,
      description,
      category_id,
      priority = 'Medium',
      latitude,
      longitude,
      address,
      landmark,
      reporter_name,
      reporter_email,
      reporter_phone,
      custom_image_url
    } = req.body;

    if (!title || !description || !category_id || !latitude || !longitude || !address) {
      return res.status(400).json({
        error: 'Missing required fields: title, description, category_id, latitude, longitude, and address are mandatory.'
      });
    }

    let id = generateIssueId();
    // Ensure uniqueness
    while (db.prepare('SELECT id FROM issues WHERE id = ?').get(id)) {
      id = generateIssueId();
    }

    // Determine image URL
    let imageUrl = custom_image_url || null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (!imageUrl) {
      // Default placeholder relevant to category
      imageUrl = 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80';
    }

    // Get default department for category
    const cat = db.prepare('SELECT default_dept_id FROM categories WHERE id = ?').get(category_id);
    const department_id = cat ? cat.default_dept_id : 'roads';

    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO issues (
        id, title, description, category_id, priority, status,
        latitude, longitude, address, landmark,
        reporter_name, reporter_email, reporter_phone,
        image_url, department_id, upvotes, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, 'Reported',
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, 1, ?, ?
      )
    `).run(
      id,
      title.trim(),
      description.trim(),
      category_id,
      priority,
      parseFloat(latitude),
      parseFloat(longitude),
      address.trim(),
      landmark ? landmark.trim() : null,
      reporter_name ? reporter_name.trim() : 'Anonymous Citizen',
      reporter_email ? reporter_email.trim() : null,
      reporter_phone ? reporter_phone.trim() : null,
      imageUrl,
      department_id,
      now,
      now
    );

    // Initial timeline entry
    db.prepare(`
      INSERT INTO timeline (issue_id, status, title, description, actor, created_at)
      VALUES (?, 'Reported', 'Complaint Submitted', ?, ?, ?)
    `).run(
      id,
      'Issue reported by citizen with GPS location and photographic evidence.',
      reporter_name ? `Citizen (${reporter_name})` : 'Citizen',
      now
    );

    const createdIssue = db.prepare(`
      SELECT i.*, c.name as category_name, c.icon as category_icon, d.name as department_name
      FROM issues i
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN departments d ON i.department_id = d.id
      WHERE i.id = ?
    `).get(id);

    res.status(201).json(formatIssue(createdIssue));
  } catch (err) {
    console.error('Error creating issue:', err);
    res.status(500).json({ error: 'Failed to create issue: ' + err.message });
  }
});

// -------------------------------------------------------------
// 6. PATCH /api/issues/:id/status - admin update status/dept/officer
// -------------------------------------------------------------
app.patch('/api/issues/:id/status', upload.single('resolution_image'), (req, res) => {
  try {
    const issueId = req.params.id.toUpperCase();
    const existing = db.prepare('SELECT * FROM issues WHERE UPPER(id) = ?').get(issueId);

    if (!existing) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const {
      status = existing.status,
      department_id = existing.department_id,
      assigned_officer = existing.assigned_officer,
      priority = existing.priority,
      notes = '',
      actor = 'Municipal Administrator'
    } = req.body;

    let resolutionImageUrl = existing.resolution_image_url;
    if (req.file) {
      resolutionImageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.resolution_image_url) {
      resolutionImageUrl = req.body.resolution_image_url;
    }

    const now = new Date().toISOString();

    db.prepare(`
      UPDATE issues SET
        status = ?,
        department_id = ?,
        assigned_officer = ?,
        priority = ?,
        resolution_image_url = ?,
        updated_at = ?
      WHERE id = ?
    `).run(status, department_id, assigned_officer, priority, resolutionImageUrl, now, existing.id);

    // Add timeline record if status or department changed or notes added
    let title = `Status Updated to ${status}`;
    if (status === 'Assigned' && department_id) {
      const dept = db.prepare('SELECT name FROM departments WHERE id = ?').get(department_id);
      title = `Assigned to ${dept ? dept.name : department_id}`;
    } else if (status === 'In Progress') {
      title = 'Work in Progress / Crew Dispatched';
    } else if (status === 'Resolved') {
      title = 'Issue Resolved & Verified';
    } else if (status === 'Rejected') {
      title = 'Issue Rejected / Non-Actionable';
    }

    const eventDescription = notes.trim() || `Status changed from ${existing.status} to ${status}.`;

    db.prepare(`
      INSERT INTO timeline (issue_id, status, title, description, actor, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(existing.id, status, title, eventDescription, actor, now);

    const updated = db.prepare(`
      SELECT i.*, c.name as category_name, c.icon as category_icon, d.name as department_name
      FROM issues i
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN departments d ON i.department_id = d.id
      WHERE i.id = ?
    `).get(existing.id);

    const timeline = db.prepare('SELECT * FROM timeline WHERE issue_id = ? ORDER BY created_at ASC').all(existing.id);

    res.json({
      ...formatIssue(updated),
      timeline
    });
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// -------------------------------------------------------------
// 7. POST /api/issues/:id/upvote - community "Me Too"
// -------------------------------------------------------------
app.post('/api/issues/:id/upvote', (req, res) => {
  try {
    const issueId = req.params.id.toUpperCase();
    const issue = db.prepare('SELECT * FROM issues WHERE UPPER(id) = ?').get(issueId);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const newUpvotes = (issue.upvotes || 0) + 1;
    db.prepare('UPDATE issues SET upvotes = ? WHERE id = ?').run(newUpvotes, issue.id);

    res.json({ id: issue.id, upvotes: newUpvotes });
  } catch (err) {
    console.error('Error upvoting issue:', err);
    res.status(500).json({ error: 'Failed to upvote' });
  }
});

// -------------------------------------------------------------
// 8. POST /api/issues/:id/feedback - citizen resolution rating
// -------------------------------------------------------------
app.post('/api/issues/:id/feedback', (req, res) => {
  try {
    const issueId = req.params.id.toUpperCase();
    const { rating, feedback } = req.body;

    const issue = db.prepare('SELECT * FROM issues WHERE UPPER(id) = ?').get(issueId);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    db.prepare('UPDATE issues SET citizen_rating = ?, citizen_feedback = ? WHERE id = ?')
      .run(rating || 5, feedback || '', issue.id);

    res.json({ success: true, message: 'Thank you for your feedback!' });
  } catch (err) {
    console.error('Error submitting feedback:', err);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// -------------------------------------------------------------
// 9. GET /api/stats - dashboard analytics
// -------------------------------------------------------------
app.get('/api/stats', (req, res) => {
  try {
    const total = db.prepare('SELECT COUNT(*) as count FROM issues').get().count;
    const reported = db.prepare("SELECT COUNT(*) as count FROM issues WHERE status = 'Reported'").get().count;
    const underReview = db.prepare("SELECT COUNT(*) as count FROM issues WHERE status = 'Under Review'").get().count;
    const inProgress = db.prepare("SELECT COUNT(*) as count FROM issues WHERE status = 'In Progress'").get().count;
    const resolved = db.prepare("SELECT COUNT(*) as count FROM issues WHERE status = 'Resolved'").get().count;
    const critical = db.prepare("SELECT COUNT(*) as count FROM issues WHERE priority = 'Critical' AND status != 'Resolved'").get().count;

    const byCategory = db.prepare(`
      SELECT c.id, c.name, COUNT(i.id) as count
      FROM categories c
      LEFT JOIN issues i ON c.id = i.category_id
      GROUP BY c.id, c.name
      ORDER BY count DESC
    `).all();

    const byDepartment = db.prepare(`
      SELECT d.id, d.name, COUNT(i.id) as total_count,
        SUM(CASE WHEN i.status = 'Resolved' THEN 1 ELSE 0 END) as resolved_count,
        SUM(CASE WHEN i.status != 'Resolved' AND i.status != 'Rejected' THEN 1 ELSE 0 END) as pending_count
      FROM departments d
      LEFT JOIN issues i ON d.id = i.department_id
      GROUP BY d.id, d.name
    `).all();

    res.json({
      total,
      reported,
      underReview,
      inProgress,
      resolved,
      critical,
      resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
      byCategory,
      byDepartment
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Serve frontend build in production
const clientDist = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`✅ Municipal Infrastructure API Server running at http://localhost:${PORT}`);
});

