const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Public
router.get('/', eventController.listEvents);

// Specific/protected routes before the ":id" catch-all
router.get('/mine/created', verifyToken, requireRole('organizer', 'admin'), eventController.myEvents);
router.post('/', verifyToken, requireRole('organizer', 'admin'), eventController.createEvent);
router.patch('/:id/status', verifyToken, requireRole('admin'), eventController.setStatus);
router.put('/:id', verifyToken, requireRole('organizer', 'admin'), eventController.updateEvent);
router.delete('/:id', verifyToken, requireRole('organizer', 'admin'), eventController.deleteEvent);

router.get('/:id', eventController.getEvent);

module.exports = router;
