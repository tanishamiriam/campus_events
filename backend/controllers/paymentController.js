const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');

// POST /api/payments/:registrationId/pay
// This is a SIMULATED payment gateway for demo purposes — no real money moves.
// It's a natural place to swap in Razorpay/Stripe later without touching the rest of the app.
exports.pay = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM registrations WHERE id = ? AND user_id = ?',
      [req.params.registrationId, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Registration not found.' });
    const reg = rows[0];

    if (reg.payment_status === 'paid') {
      return res.status(400).json({ message: 'This ticket is already paid for.' });
    }

    const transactionId = 'TXN-' + uuidv4().slice(0, 12).toUpperCase();

    await pool.query(
      'UPDATE payments SET status = ?, transaction_id = ? WHERE registration_id = ?',
      ['success', transactionId, reg.id]
    );
    await pool.query('UPDATE registrations SET payment_status = ? WHERE id = ?', ['paid', reg.id]);

    res.json({ message: 'Payment successful! Your ticket is ready.', transactionId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Payment could not be processed.' });
  }
};
