const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.post('/:registrationId/pay', verifyToken, requireRole('attendee'), paymentController.pay);

module.exports = router;
