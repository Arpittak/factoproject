import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './InventoryFilters.css';

// We can reuse the procurement form's CSS for a consistent look
import './AddProcurementForm.css';

const initialFilters = {
    stone_type: '',
    stone_name: '',
    stage_id: '',
    edges_type_id: '',
    finishing_type_id: '',
};

function InventoryFilters({ onFilterChange, currentFilters = {} }) {
  const [filters, setFilters] = useState(currentFilters);

  // State for the dropdown options
  const [stoneTypes, setStoneTypes] = useState([]);
  const [stages, setStages] = useState([]);
  const [edges, setEdges] = useState([]);
  const [finishes, setFinishes] = useState([]);

  // Update local filters when currentFilters prop changes (for clearing)
  useEffect(() => {
    setFilters(currentFilters);
  }, [currentFilters]);

  // Fetch data for all dropdowns on component load
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [stonesRes, stagesRes, edgesRes, finishesRes] = await Promise.all([
          axios.get('/api/master/stones'),
          axios.get('/api/master/stages'),
          axios.get('/api/master/edges'),
          axios.get('/api/master/finishes'),
        ]);
        // Get unique stone types from the full stone list
        setStoneTypes([...new Set(stonesRes.data.map(s => s.stone_type))]);
        setStages(stagesRes.data);
        setEdges(edgesRes.data);
        setFinishes(finishesRes.data);
      } catch (error) {
        console.error("Failed to fetch filter dropdown data", error);
      }
    };
    fetchDropdownData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters); // Notify parent component of the change
  };

  return (
    <div className="form-section" style={{border: 'none', padding: '0'}}>
      <div className="fields-row">
        <div className="field-container" style={{ width: '24%' }}>
          <label>Stone Type</label>
          <select className="form-input" name="stone_type" value={filters.stone_type} onChange={handleChange}>
            <option value="">All Types</option>
            {stoneTypes.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>

        <div className="field-container" style={{ width: '24%' }}>
          <label>Stone Name</label>
          <input 
            type="text" 
            className="form-input" 
            name="stone_name" 
            value={filters.stone_name} 
            onChange={handleChange} 
            placeholder="Search by name..."
          />
        </div>

        <div className="field-container" style={{ width: '15%' }}>
          <label>Stage</label>
          <select className="form-input" name="stage_id" value={filters.stage_id} onChange={handleChange}>
            <option value="">All</option>
            {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div className="field-container" style={{ width: '15%' }}>
          <label>Edges</label>
          <select className="form-input" name="edges_type_id" value={filters.edges_type_id} onChange={handleChange}>
            <option value="">All</option>
            {edges.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
        
        <div className="field-container" style={{ width: '15%' }}>
          <label>Finishing</label>
          <select className="form-input" name="finishing_type_id" value={filters.finishing_type_id} onChange={handleChange}>
            <option value="">All</option>
            {finishes.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}

export default InventoryFilters;