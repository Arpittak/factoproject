const Stone = require('../models/Stone');
const MasterData = require('../models/MasterData');

class MasterDataController {
  
  // @desc    Get all stones
  // @route   GET /api/master/stones
  static async getAllStones(req, res, next) {
    try {
      const stones = await Stone.findAll();
      
      res.status(200).json({
        success: true,
        data: stones,
        message: `Found ${stones.length} stones`
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get all stages
  // @route   GET /api/master/stages
  static async getAllStages(req, res, next) {
    try {
      const stages = await MasterData.getAllStages();
      
      res.status(200).json({
        success: true,
        data: stages,
        message: `Found ${stages.length} stages`
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get all edge types
  // @route   GET /api/master/edges
  static async getAllEdgeTypes(req, res, next) {
    try {
      const edges = await MasterData.getAllEdgeTypes();
      
      res.status(200).json({
        success: true,
        data: edges,
        message: `Found ${edges.length} edge types`
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get all finishing types
  // @route   GET /api/master/finishes
  static async getAllFinishingTypes(req, res, next) {
    try {
      const finishes = await MasterData.getAllFinishingTypes();
      
      res.status(200).json({
        success: true,
        data: finishes,
        message: `Found ${finishes.length} finishing types`
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get all HSN codes
  // @route   GET /api/master/hsn-codes
  static async getAllHsnCodes(req, res, next) {
    try {
      const codes = await MasterData.getAllHsnCodes();
      
      res.status(200).json({
        success: true,
        data: codes,
        message: `Found ${codes.length} HSN codes`
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MasterDataController;