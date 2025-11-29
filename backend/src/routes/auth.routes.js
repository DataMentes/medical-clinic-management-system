const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

/**
 * Auth Routes
 * Base path: /api/auth
 */

// POST /api/auth/register - Register new user
router.post('/register', authController.register);

// POST /api/auth/login - Login user
router.post('/login', authController.login);

// GET /api/auth/me - Get current user (requires authentication)
router.get('/me', authMiddleware.authenticate, authController.me);

// POST /api/auth/logout - Logout user (requires authentication)
router.post('/logout', authMiddleware.authenticate, authController.logout);

module.exports = router;
