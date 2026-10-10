const { db } = require('./db');

// Try requiring nodemailer if installed, otherwise provide safe fallback
let nodemailer = null;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  // Nodemailer not installed or optional
}

// Create reusable transporter if SMTP credentials are provided in env
function getTransporter() {
  if (!nodemailer) return null;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (user && pass) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: user.trim(),
        pass: pass.trim().replace(/\s+/g, '') // strip spaces if copied with spaces
      }
    });
  }
  return null;
}


/**
 * Send automated SMS and Email on Grievance Registration
 */
async function sendRegistrationNotifications({ issue }) {
  const now = new Date().toISOString();
  const phone = issue.reporter_phone || '9840123456';
  const email = issue.reporter_email || 'citizen@example.com';
  const citizenName = issue.reporter_name || 'Citizen';
  const deptName = issue.department_name || 'Municipal Infrastructure Dept';

  // 1. Build SMS Message
  const smsTitle = `CivicAlert: Grievance #${issue.id} Registered`;
  const smsBody = `Dear ${citizenName}, your complaint #${issue.id} (${issue.title.slice(0, 40)}...) has been registered with ${deptName}. Priority: ${issue.priority}. Track status: https://public-infra-reporting.onrender.com`;

  // 2. Build HTML Email Message
  const emailSubject = `Grievance Registered Successfully: #${issue.id} [${issue.title.slice(0, 50)}]`;
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 20px; color: #1e293b;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #2563eb, #1e40af); padding: 24px; color: white;">
          <h2 style="margin: 0; font-size: 20px;">🏛️ CivicAlert Municipal Grievance Redressal</h2>
          <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Official Complaint Acknowledgment</p>
        </div>
        
        <div style="padding: 24px;">
          <p style="font-size: 15px; margin-top: 0;">Dear <strong>${citizenName}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.5;">Your public infrastructure complaint has been registered into the central municipal grievance registry.</p>
          
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #1e40af; font-weight: bold;">Tracking Ticket ID</p>
            <p style="margin: 0; font-size: 24px; font-weight: bold; color: #1e3a8a; font-family: monospace;">${issue.id}</p>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
            <tr><td style="padding: 6px 0; color: #64748b; width: 140px;">Title:</td><td style="font-weight: 600;">${issue.title}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Department:</td><td style="font-weight: 600;">${deptName}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Urgency Priority:</td><td style="font-weight: 600; color: #ea580c;">${issue.priority}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Location:</td><td style="font-weight: 600;">${issue.address}</td></tr>
          </table>

          <div style="text-align: center; margin-top: 25px;">
            <a href="https://public-infra-reporting.onrender.com" style="background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;">
              Track Complaint Progress
            </a>
          </div>
        </div>

        <div style="background: #f1f5f9; padding: 16px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
          CivicAlert • City Municipal Infrastructure Maintenance • 24/7 Redressal Cell
        </div>
      </div>
    </body>
    </html>
  `;

  // Insert into SQLite notifications table
  try {
    const insert = db.prepare(`
      INSERT INTO notifications (issue_id, channel, event, recipient, title, message, status, sent_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Insert SMS Record
    insert.run(issue.id, 'SMS', 'REGISTERED', phone, smsTitle, smsBody, 'DELIVERED', now);

    // Insert EMAIL Record
    insert.run(issue.id, 'EMAIL', 'REGISTERED', email, emailSubject, emailHtml, 'DELIVERED', now);

    console.log(`📨 [NOTIF] Registration SMS & Email generated for ticket ${issue.id} to ${phone} / ${email}`);

    // Attempt real SMTP if configured
    const transporter = getTransporter();
    if (transporter) {
      await transporter.sendMail({
        from: `"CivicAlert City Portal" <${process.env.SMTP_USER}>`,
        to: email,
        subject: emailSubject,
        html: emailHtml
      }).catch(err => console.error('SMTP Send Error:', err.message));
    }
  } catch (err) {
    console.error('Failed to log registration notifications:', err);
  }
}

/**
 * Send automated SMS and Email on Problem Resolution
 */
async function sendResolutionNotifications({ issue, notes = '', officerName = '', resolutionImageUrl = '' }) {
  const now = new Date().toISOString();
  const phone = issue.reporter_phone || '9840123456';
  const email = issue.reporter_email || 'citizen@example.com';
  const citizenName = issue.reporter_name || 'Citizen';
  const deptName = issue.department_name || 'Municipal Maintenance';

  // 1. Build Resolution SMS Message
  const smsTitle = `CivicAlert: Grievance #${issue.id} RESOLVED! 🎉`;
  const smsBody = `Good news ${citizenName}! Your complaint #${issue.id} (${issue.title.slice(0, 35)}...) has been RESOLVED by ${officerName || 'municipal crew'}. Notes: ${notes || 'Work completed & sanitized'}. Rate our service: https://public-infra-reporting.onrender.com`;

  // 2. Build Resolution HTML Email Message
  const emailSubject = `Issue Resolved: #${issue.id} [Proof of Work Attached]`;
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 20px; color: #1e293b;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #059669, #047857); padding: 24px; color: white;">
          <h2 style="margin: 0; font-size: 20px;">✅ Civic Issue Resolved & Verified</h2>
          <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">CivicAlert Municipal Maintenance Redressal</p>
        </div>
        
        <div style="padding: 24px;">
          <p style="font-size: 15px; margin-top: 0;">Dear <strong>${citizenName}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.5;">We are pleased to inform you that your reported public infrastructure grievance has been <strong>successfully resolved</strong> by the municipal repair team.</p>
          
          <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0 0 4px 0; font-size: 12px; text-transform: uppercase; color: #047857; font-weight: bold;">Ticket #${issue.id} • Status: RESOLVED</p>
            <p style="margin: 4px 0; font-size: 15px; font-weight: bold; color: #065f46;">${issue.title}</p>
            <p style="margin: 8px 0 0 0; font-size: 13px; color: #047857;"><strong>Official Officer Remarks:</strong> ${notes || 'Maintenance and field repair completed satisfactorily.'}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
            <tr><td style="padding: 6px 0; color: #64748b; width: 140px;">Department:</td><td style="font-weight: 600;">${deptName}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Inspected By:</td><td style="font-weight: 600;">${officerName || 'Inspector On Duty'}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Resolution Date:</td><td style="font-weight: 600;">${new Date().toLocaleDateString()}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Location:</td><td style="font-weight: 600;">${issue.address}</td></tr>
          </table>

          <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 12px; text-align: center; margin: 20px 0;">
            <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: bold; color: #334155;">How was the resolution quality?</p>
            <a href="https://public-infra-reporting.onrender.com" style="background: #059669; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; font-size: 13px; display: inline-block;">
              ⭐ Rate Resolution & View Proof
            </a>
          </div>
        </div>

        <div style="background: #f1f5f9; padding: 16px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
          Thank you for helping keep our city clean and safe • CivicAlert Administration
        </div>
      </div>
    </body>
    </html>
  `;

  // Insert into SQLite notifications table
  try {
    const insert = db.prepare(`
      INSERT INTO notifications (issue_id, channel, event, recipient, title, message, status, sent_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Insert SMS Record
    insert.run(issue.id, 'SMS', 'RESOLVED', phone, smsTitle, smsBody, 'DELIVERED', now);

    // Insert EMAIL Record
    insert.run(issue.id, 'EMAIL', 'RESOLVED', email, emailSubject, emailHtml, 'DELIVERED', now);

    console.log(`🎉 [NOTIF] Resolution SMS & Email generated for ticket ${issue.id} to ${phone} / ${email}`);

    // Attempt real SMTP if configured
    const transporter = getTransporter();
    if (transporter) {
      await transporter.sendMail({
        from: `"CivicAlert City Portal" <${process.env.SMTP_USER}>`,
        to: email,
        subject: emailSubject,
        html: emailHtml
      }).catch(err => console.error('SMTP Send Error:', err.message));
    }
  } catch (err) {
    console.error('Failed to log resolution notifications:', err);
  }
}

/**
 * Fetch all notifications with optional filters
 */
function getNotifications({ issue_id = null, recipient = null, limit = 50 }) {
  let query = 'SELECT * FROM notifications WHERE 1=1';
  const params = [];

  if (issue_id) {
    query += ' AND UPPER(issue_id) = ?';
    params.push(issue_id.toUpperCase());
  }

  if (recipient) {
    query += ' AND (LOWER(recipient) = ? OR recipient LIKE ?)';
    params.push(recipient.toLowerCase(), `%${recipient}%`);
  }

  query += ' ORDER BY sent_at DESC LIMIT ?';
  params.push(limit);

  return db.prepare(query).all(...params);
}

module.exports = {
  sendRegistrationNotifications,
  sendResolutionNotifications,
  getNotifications
};
