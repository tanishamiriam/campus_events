const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.post('/checkin', verifyToken, requireRole('organizer', 'admin'), registrationController.checkIn);
router.post('/sell/:eventId', verifyToken, requireRole('organizer', 'admin'), registrationController.sell);
router.get('/my', verifyToken, registrationController.myRegistrations);
router.get('/event/:eventId', verifyToken, requireRole('organizer', 'admin'), registrationController.eventAttendees);
router.post('/:eventId', verifyToken, requireRole('attendee'), registrationController.register);

module.exports = router;
