const express = require('express');
const InventoryController = require('../controllers/inventoryController');

const router = express.Router();

// IMPORTANT: Put specific routes BEFORE parameterized routes
router.get('/analytics', InventoryController.getInventoryAnalytics);
router.get('/', InventoryController.getAllInventoryItems);
router.post('/manual-add', InventoryController.manualAddTransaction);
router.post('/manual-adjust', InventoryController.manualAdjustTransaction);
router.get('/:id/transactions', InventoryController.getTransactionsForItem); 
router.delete('/:id', InventoryController.deleteInventoryItem);

module.exports = router;