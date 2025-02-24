// routes/adminRoutes.js
const { Router } = require('express');
const { adminAuth } = require('../middleware/adminMiddleware');
const adminController = require('../controllers/adminController');

const router = Router();

// All routes in this file require admin authentication
router.use(adminAuth);

// Admin user management routes
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Admin dashboard stats
router.get('/dashboard/stats', adminController.getDashboardStats);

// Admin settings routes
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

module.exports = router;