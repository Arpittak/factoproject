const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

// IMPORTANT: Put specific routes BEFORE parameterized routes
router.get('/analytics', inventoryController.getInventoryAnalytics);
router.get('/', inventoryController.getAllInventoryItems);
router.post('/manual-add', inventoryController.manualAddTransaction);
router.post('/manual-adjust', inventoryController.manualAdjustTransaction);
router.get('/:id/transactions', inventoryController.getTransactionsForItem); 
router.delete('/:id', inventoryController.deleteInventoryItem);

module.exports = router;