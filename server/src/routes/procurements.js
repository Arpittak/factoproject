const express = require('express');
const ProcurementsController = require('../controllers/procurementsController');

const router = express.Router();

// IMPORTANT: Put specific routes BEFORE parameterized routes
router.delete('/items/:procurementItemId', ProcurementsController.deleteProcurementItem);
router.post('/:procurementId/items', ProcurementsController.addProcurementItem);
router.get('/analytics', ProcurementsController.getProcurementAnalytics);
router.get('/:id', ProcurementsController.getProcurementById);
router.get('/', ProcurementsController.getAllProcurements);
router.post('/', ProcurementsController.createProcurement);

module.exports = router;