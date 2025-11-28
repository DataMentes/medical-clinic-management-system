const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resource.controller');

/**
 * Routes for [Resource]
 * Base path: /api/resources
 */

// GET /api/resources - Get all resources
router.get('/', resourceController.index);

// GET /api/resources/:id - Get single resource
router.get('/:id', resourceController.show);

// POST /api/resources - Create new resource
router.post('/', resourceController.store);

// PUT /api/resources/:id - Update resource
router.put('/:id', resourceController.update);

// DELETE /api/resources/:id - Delete resource
router.delete('/:id', resourceController.destroy);

module.exports = router;
