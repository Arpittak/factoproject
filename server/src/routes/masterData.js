const express = require('express');
const router = express.Router();
const masterDataController = require('../controllers/masterDataController');

router.get('/stones', masterDataController.getAllStones);
router.get('/stages', masterDataController.getAllStages);
router.get('/edges', masterDataController.getAllEdgeTypes);
router.get('/finishes', masterDataController.getAllFinishingTypes);
router.get('/hsn-codes', masterDataController.getAllHsnCodes);

module.exports = router;