const express = require('express');
const InventoryController = require('../controllers/inventoryController');
const { validateInventoryItem } = require('../middleware/validation');

const router = express.Router();

// IMPORTANT: Put specific routes BEFORE parameterized routes
router.get('/analytics', InventoryController.getInventoryAnalytics);
router.get('/', InventoryController.getAllInventoryItems);
router.post('/manual-add', validateInventoryItem, InventoryController.manualAddTransaction);
router.post('/manual-adjust', validateInventoryItem, InventoryController.manualAdjustTransaction);
router.get('/:id/transactions', InventoryController.getTransactionsForItem); 
router.delete('/:id', InventoryController.deleteInventoryItem);

module.exports = router;