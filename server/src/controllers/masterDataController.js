const db = require('../config/db');

// Get all stones for dropdowns
// Replace your existing getAllStones function with this new version.
// The other functions in this file (getAllStages, etc.) are fine and don't need changes.

exports.getAllStones = async (req, res) => {
  try {
    const [stones] = await db.query('SELECT id, stone_name, stone_type FROM stones ORDER BY stone_name ASC');
    res.status(200).json(stones);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Add this new function to get HSN codes
exports.getAllHsnCodes = async (req, res) => {
  try {
    const [codes] = await db.query('SELECT * FROM hsn_codes ORDER BY code ASC');
    res.status(200).json(codes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


// Get all stages for dropdowns
exports.getAllStages = async (req, res) => {
  try {
    const [stages] = await db.query('SELECT * FROM stages');
    res.status(200).json(stages);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all edge types for dropdowns
exports.getAllEdgeTypes = async (req, res) => {
  try {
    const [edges] = await db.query('SELECT * FROM edges_types');
    res.status(200).json(edges);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all finishing types for dropdowns
exports.getAllFinishingTypes = async (req, res) => {
  try {
    const [finishes] = await db.query('SELECT * FROM finishing_types');
    res.status(200).json(finishes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};