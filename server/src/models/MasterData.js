const db = require('../config/db');
const { DatabaseError } = require('../utils/errors');

class MasterData {
  
  // Stages
  static async getAllStages() {
    try {
      const [rows] = await db.execute('SELECT * FROM stages ORDER BY id');
      return rows;
    } catch (error) {
      throw new DatabaseError(`Failed to fetch stages: ${error.message}`);
    }
  }

  // Edge Types
  static async getAllEdgeTypes() {
    try {
      const [rows] = await db.execute('SELECT * FROM edges_types ORDER BY id');
      return rows;
    } catch (error) {
      throw new DatabaseError(`Failed to fetch edge types: ${error.message}`);
    }
  }

  // Finishing Types
  static async getAllFinishingTypes() {
    try {
      const [rows] = await db.execute('SELECT * FROM finishing_types ORDER BY id');
      return rows;
    } catch (error) {
      throw new DatabaseError(`Failed to fetch finishing types: ${error.message}`);
    }
  }

  // HSN Codes
  static async getAllHsnCodes() {
    try {
      const [rows] = await db.execute('SELECT * FROM hsn_codes ORDER BY code ASC');
      return rows;
    } catch (error) {
      throw new DatabaseError(`Failed to fetch HSN codes: ${error.message}`);
    }
  }
}

module.exports = MasterData;