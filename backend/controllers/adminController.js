const pool = require('../config/db');

// GET /api/admin/stats
exports.stats = async (req, res) => {
  try {
    const [[userCounts]] = await pool.query(`
      SELECT
        SUM(role = 'attendee') AS attendees,
        SUM(role = 'organizer') AS organizers,
        SUM(role = 'admin') AS admins,
        COUNT(*) AS total
      FROM users`);

    const [[eventCounts]] = await pool.query(`
      SELECT
        SUM(status = 'pending') AS pending,
        SUM(status = 'approved') AS approved,
        SUM(status = 'rejected') AS rejected,
        SUM(status = 'cancelled') AS cancelled,
        COUNT(*) AS total
      FROM events`);

    const [[regCounts]] = await pool.query(`SELECT COUNT(*) AS total FROM registrations`);

    const [[revenue]] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE status = 'success'`
    );

    const [categoryBreakdown] = await pool.query(`
      SELECT category, COUNT(*) AS count FROM events WHERE status = 'approved' GROUP BY category
    `);

    res.json({ users: userCounts, events: eventCounts, registrations: regCounts.total, revenue: revenue.total, categoryBreakdown });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load stats.' });
  }
};

// GET /api/admin/events — every event regardless of status, for moderation
exports.allEvents = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT e.*, u.name AS organizer_name,
        (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id) AS seats_taken
      FROM events e JOIN users u ON u.id = e.organizer_id
      ORDER BY e.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load events.' });
  }
};

// GET /api/admin/users
exports.allUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, department, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load users.' });
  }
};

// PATCH /api/admin/users/:id/role
exports.setUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'organizer', 'attendee'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }
    if (Number(req.params.id) === req.user.id) {
      return res.status(400).json({ message: "You can't change your own role." });
    }
    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
    res.json({ message: 'User role updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not update user role.' });
  }
};
