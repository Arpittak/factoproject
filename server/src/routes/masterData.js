const express = require('express');
const MasterDataController = require('../controllers/masterDataController');

const router = express.Router();

router.get('/stones', MasterDataController.getAllStones);
router.get('/stages', MasterDataController.getAllStages);
router.get('/edges', MasterDataController.getAllEdgeTypes);
router.get('/finishes', MasterDataController.getAllFinishingTypes);
router.get('/hsn-codes', MasterDataController.getAllHsnCodes);

module.exports = router;