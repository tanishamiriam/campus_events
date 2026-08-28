const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');
const { generateQRDataUrl } = require('../utils/qrcode');

// POST /api/registrations/:eventId — attendee registers for an event
exports.register = async (req, res) => {
  try {
    const eventId = req.params.eventId;

    const [eventRows] = await pool.query('SELECT * FROM events WHERE id = ?', [eventId]);
    if (eventRows.length === 0) return res.status(404).json({ message: 'Event not found.' });
    const event = eventRows[0];

    if (event.status !== 'approved') {
      return res.status(400).json({ message: 'This event is not open for registration.' });
    }

    const [[{ count }]] = await pool.query(
      'SELECT COUNT(*) AS count FROM registrations WHERE event_id = ?', [eventId]
    );
    if (count >= event.capacity) {
      return res.status(400).json({ message: 'This event is full.' });
    }

    const [dupe] = await pool.query(
      'SELECT id FROM registrations WHERE event_id = ? AND user_id = ?', [eventId, req.user.id]
    );
    if (dupe.length > 0) {
      return res.status(409).json({ message: 'You are already registered for this event.' });
    }

    const ticketCode = uuidv4();
    const isPaid = Number(event.price) > 0;
    const paymentStatus = isPaid ? 'pending' : 'free';

    const [result] = await pool.query(
      'INSERT INTO registrations (event_id, user_id, ticket_code, payment_status) VALUES (?, ?, ?, ?)',
      [eventId, req.user.id, ticketCode, paymentStatus]
    );

    if (isPaid) {
      await pool.query(
        'INSERT INTO payments (registration_id, amount, status) VALUES (?, ?, ?)',
        [result.insertId, event.price, 'pending']
      );
    }

    res.status(201).json({
      registrationId: result.insertId,
      ticketCode,
      requiresPayment: isPaid,
      amount: event.price,
      message: isPaid ? 'Registered — complete payment to receive your ticket.' : 'You are registered! Your ticket is ready.'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not complete registration.' });
  }
};

// GET /api/registrations/my — attendee's own tickets, with QR for paid ones
exports.myRegistrations = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, e.title, e.venue, e.event_date, e.event_time, e.banner_url, e.price
       FROM registrations r JOIN events e ON e.id = r.event_id
       WHERE r.user_id = ? ORDER BY e.event_date ASC`,
      [req.user.id]
    );

    const withQr = await Promise.all(rows.map(async (r) => {
      const qr = r.payment_status !== 'pending' ? await generateQRDataUrl(r.ticket_code) : null;
      return { ...r, qr_code: qr };
    }));

    res.json(withQr);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load your tickets.' });
  }
};

// GET /api/registrations/event/:eventId — organizer/admin view attendee list
exports.eventAttendees = async (req, res) => {
  try {
    const [eventRows] = await pool.query('SELECT * FROM events WHERE id = ?', [req.params.eventId]);
    if (eventRows.length === 0) return res.status(404).json({ message: 'Event not found.' });

    if (req.user.role !== 'admin' && eventRows[0].organizer_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only view attendees for your own events.' });
    }

    const [rows] = await pool.query(
      `SELECT r.id, r.ticket_code, r.payment_status, r.checked_in, r.checked_in_at, r.created_at,
              u.name, u.email, u.department
       FROM registrations r JOIN users u ON u.id = r.user_id
       WHERE r.event_id = ? ORDER BY r.created_at ASC`,
      [req.params.eventId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load attendees.' });
  }
};

// POST /api/registrations/sell/:eventId — organizer/admin issues a ticket in person (walk-in sale)
// The attendee must already have an account (organizer looks them up by email) — this just
// skips the online payment step since money changed hands at the door.
exports.sell = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "The attendee's email is required." });

    const [eventRows] = await pool.query('SELECT * FROM events WHERE id = ?', [eventId]);
    if (eventRows.length === 0) return res.status(404).json({ message: 'Event not found.' });
    const event = eventRows[0];

    if (req.user.role !== 'admin' && event.organizer_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only sell tickets for your own events.' });
    }

    const [userRows] = await pool.query('SELECT * FROM users WHERE email = ? AND role = ?', [email, 'attendee']);
    if (userRows.length === 0) {
      return res.status(404).json({ message: 'No attendee account found with that email. Ask them to sign up first.' });
    }
    const attendee = userRows[0];

    const [[{ count }]] = await pool.query(
      'SELECT COUNT(*) AS count FROM registrations WHERE event_id = ?', [eventId]
    );
    if (count >= event.capacity) {
      return res.status(400).json({ message: 'This event is sold out.' });
    }

    const [dupe] = await pool.query(
      'SELECT id FROM registrations WHERE event_id = ? AND user_id = ?', [eventId, attendee.id]
    );
    if (dupe.length > 0) {
      return res.status(409).json({ message: 'This attendee already has a ticket for this event.' });
    }

    const ticketCode = uuidv4();
    const isPaid = Number(event.price) > 0;

    const [result] = await pool.query(
      'INSERT INTO registrations (event_id, user_id, ticket_code, payment_status) VALUES (?, ?, ?, ?)',
      [eventId, attendee.id, ticketCode, isPaid ? 'paid' : 'free']
    );

    if (isPaid) {
      await pool.query(
        'INSERT INTO payments (registration_id, amount, status, transaction_id) VALUES (?, ?, ?, ?)',
        [result.insertId, event.price, 'success', 'DOOR-' + uuidv4().slice(0, 8).toUpperCase()]
      );
    }

    res.status(201).json({ message: `Ticket sold to ${attendee.name}.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not sell this ticket.' });
  }
};


exports.checkIn = async (req, res) => {
  try {
    const { ticket_code } = req.body;
    if (!ticket_code) return res.status(400).json({ message: 'Ticket code is required.' });

    const [rows] = await pool.query(
      `SELECT r.*, e.title, e.organizer_id FROM registrations r
       JOIN events e ON e.id = r.event_id WHERE r.ticket_code = ?`,
      [ticket_code]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'No ticket found with that code.' });
    const reg = rows[0];

    if (req.user.role !== 'admin' && reg.organizer_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only check in attendees for your own events.' });
    }

    if (reg.payment_status === 'pending') {
      return res.status(400).json({ message: 'Payment is still pending for this ticket.' });
    }
    if (reg.checked_in) {
      return res.status(409).json({ message: `Already checked in at ${new Date(reg.checked_in_at).toLocaleString()}.` });
    }

    await pool.query('UPDATE registrations SET checked_in = TRUE, checked_in_at = NOW() WHERE id = ?', [reg.id]);
    res.json({ message: `Checked in for "${reg.title}".` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not check in this ticket.' });
  }
};
