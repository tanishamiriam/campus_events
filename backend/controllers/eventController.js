const pool = require('../config/db');

// GET /api/events — public, only approved + upcoming-first, supports search/category filters
exports.listEvents = async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = `
      SELECT e.*, u.name AS organizer_name,
        (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id) AS seats_taken
      FROM events e
      JOIN users u ON u.id = e.organizer_id
      WHERE e.status = 'approved'
    `;
    const params = [];

    if (search) {
      query += ' AND (e.title LIKE ? OR e.description LIKE ? OR e.venue LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (category && category !== 'All') {
      query += ' AND e.category = ?';
      params.push(category);
    }

    query += ' ORDER BY e.event_date ASC, e.event_time ASC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load events.' });
  }
};

// GET /api/events/:id — public event detail
exports.getEvent = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.*, u.name AS organizer_name,
        (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id) AS seats_taken
       FROM events e JOIN users u ON u.id = e.organizer_id WHERE e.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Event not found.' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load this event.' });
  }
};

// POST /api/events — organizer or admin creates an event (auto-approved)
exports.createEvent = async (req, res) => {
  try {
    const { title, description, category, venue, event_date, event_time, capacity, price, banner_url } = req.body;

    if (!title || !venue || !event_date || !event_time) {
      return res.status(400).json({ message: 'Title, venue, date and time are required.' });
    }

    // Set to 'approved' directly so organizer events go live immediately on the home page
    const status = 'approved';

    const [result] = await pool.query(
      `INSERT INTO events (title, description, category, venue, event_date, event_time, capacity, price, banner_url, organizer_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description || '',
        category || 'General',
        venue,
        event_date,
        event_time,
        capacity || 100,
        price || 0,
        banner_url || null,
        req.user.id,
        status,
      ]
    );

    res.status(201).json({ id: result.insertId, status, message: 'Event created and published.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not create the event.' });
  }
};

// PUT /api/events/:id — owning organizer or admin (auto-approved on update)
exports.updateEvent = async (req, res) => {
  try {
    const [existingRows] = await pool.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
    if (existingRows.length === 0) return res.status(404).json({ message: 'Event not found.' });
    const event = existingRows[0];

    if (req.user.role !== 'admin' && event.organizer_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own events.' });
    }

    const { title, description, category, venue, event_date, event_time, capacity, price, banner_url } = req.body;

    // Keep it approved on update
    const status = 'approved';

    await pool.query(
      `UPDATE events SET title=?, description=?, category=?, venue=?, event_date=?, event_time=?,
       capacity=?, price=?, banner_url=?, status=? WHERE id=?`,
      [
        title ?? event.title,
        description ?? event.description,
        category ?? event.category,
        venue ?? event.venue,
        event_date ?? event.event_date,
        event_time ?? event.event_time,
        capacity ?? event.capacity,
        price ?? event.price,
        banner_url ?? event.banner_url,
        status,
        req.params.id,
      ]
    );

    res.json({ message: 'Event updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not update the event.' });
  }
};

// DELETE /api/events/:id — owning organizer or admin
exports.deleteEvent = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Event not found.' });

    if (req.user.role !== 'admin' && rows[0].organizer_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own events.' });
    }

    await pool.query('DELETE FROM events WHERE id = ?', [req.params.id]);
    res.json({ message: 'Event deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not delete the event.' });
  }
};

// GET /api/events/mine/created — organizer's own events (any status)
exports.myEvents = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.*, (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id) AS seats_taken
       FROM events e WHERE e.organizer_id = ? ORDER BY e.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load your events.' });
  }
};

// PATCH /api/events/:id/status — admin approves/rejects/cancels
exports.setStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }
    await pool.query('UPDATE events SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: `Event marked as ${status}.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not update event status.' });
  }
};