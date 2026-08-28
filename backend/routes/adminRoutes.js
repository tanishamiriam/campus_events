const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken, requireRole('admin'));

router.get('/stats', adminController.stats);
router.get('/events', adminController.allEvents);
router.get('/users', adminController.allUsers);
router.patch('/users/:id/role', adminController.setUserRole);

module.exports = router;
