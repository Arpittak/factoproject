const Stone = require('../models/Stone');
const MasterData = require('../models/MasterData');
const asyncHandler = require('../middleware/asyncHandler');

class MasterDataController {
  
  // @desc    Get all stones
  // @route   GET /api/master/stones
  static getAllStones = asyncHandler(async (req, res) => {
    const stones = await Stone.findAll();
    
    res.status(200).json({
      success: true,
     stones: stones,
      message: `Found ${stones.length} stones`
    });
  });

  // @desc    Get all stages
  // @route   GET /api/master/stages
  static getAllStages = asyncHandler(async (req, res) => {
    const stages = await MasterData.getAllStages();
    
    res.status(200).json({
      success: true,
      stages: stages,
      message: `Found ${stages.length} stages`
    });
  });

  // @desc    Get all edge types
  // @route   GET /api/master/edges
  static getAllEdgeTypes = asyncHandler(async (req, res) => {
    const edges = await MasterData.getAllEdgeTypes();
    
    res.status(200).json({
      success: true,
      edges: edges,
      message: `Found ${edges.length} edge types`
    });
  });

  // @desc    Get all finishing types
  // @route   GET /api/master/finishes
  static getAllFinishingTypes = asyncHandler(async (req, res) => {
    const finishes = await MasterData.getAllFinishingTypes();
    
    res.status(200).json({
      success: true,
      finishes: finishes,
      message: `Found ${finishes.length} finishing types`
    });
  });

  // @desc    Get all HSN codes
  // @route   GET /api/master/hsn-codes
  static getAllHsnCodes = asyncHandler(async (req, res) => {
    const codes = await MasterData.getAllHsnCodes();
    
    res.status(200).json({
      success: true,
      hsnCodes: codes,
      message: `Found ${codes.length} HSN codes`
    });
  });
}

module.exports = MasterDataController;