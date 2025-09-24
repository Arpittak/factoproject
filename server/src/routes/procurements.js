const express = require('express');
const router = express.Router();
const procurementsController = require('../controllers/procurementsController');

// IMPORTANT: Put analytics route BEFORE the generic GET route
// Put analytics route BEFORE the generic route
router.delete('/items/:procurementItemId', procurementsController.deleteProcurementItem);
router.post('/:procurementId/items', procurementsController.addProcurementItem);
router.get('/analytics', procurementsController.getProcurementAnalytics);
router.get('/:id', procurementsController.getProcurementById);  // ADD THIS LINE
router.get('/', procurementsController.getAllProcurements);
router.post('/', procurementsController.createProcurement);

module.exports = router;