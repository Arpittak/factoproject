import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './InventoryFilters.css';
import './AddProcurementForm.css';

const initialFilters = {
    vendor_id: '',
    supplier_invoice: '',
    date_received: '',
    stone_type: '',
    stone_name: '',
    stage_id: ''
};

function ProcurementFilters({ onFilterChange, currentFilters = {} }) {
  const [filters, setFilters] = useState(currentFilters);

  // State for the dropdown options
  const [vendors, setVendors] = useState([]);
  const [stoneTypes, setStoneTypes] = useState([]);
  const [stages, setStages] = useState([]);

  // Update local filters when currentFilters prop changes (for clearing)
  useEffect(() => {
    setFilters(currentFilters);
  }, [currentFilters]);

  // Fetch data for all dropdowns on component load
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [vendorsRes, stonesRes, stagesRes] = await Promise.all([
          axios.get('/api/vendors'),
          axios.get('/api/master/stones'),
          axios.get('/api/master/stages')
        ]);
        setVendors(vendorsRes.data);
        setStoneTypes([...new Set(stonesRes.data.map(s => s.stone_type))]);
        setStages(stagesRes.data);
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
        <div className="field-container" style={{ width: '20%' }}>
          <label>Stone Type</label>
          <select className="form-input" name="stone_type" value={filters.stone_type} onChange={handleChange}>
            <option value="">All Types</option>
            {stoneTypes.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>

        <div className="field-container" style={{ width: '20%' }}>
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

        <div className="field-container" style={{ width: '20%' }}>
          <label>Vendor</label>
          <select className="form-input" name="vendor_id" value={filters.vendor_id} onChange={handleChange}>
            <option value="">All Vendors</option>
            {vendors.map(v => <option key={v.id} value={v.id}>{v.company_name}</option>)}
          </select>
        </div>

        <div className="field-container" style={{ width: '15%' }}>
          <label>Stage</label>
          <select className="form-input" name="stage_id" value={filters.stage_id} onChange={handleChange}>
            <option value="">All</option>
            {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div className="field-container" style={{ width: '12%' }}>
          <label>Date Received</label>
          <input 
            type="date" 
            className="form-input" 
            name="date_received" 
            value={filters.date_received} 
            onChange={handleChange} 
          />
        </div>
        
        <div className="field-container" style={{ width: '13%' }}>
          <label>Supplier Invoice</label>
          <input 
            type="text" 
            className="form-input" 
            name="supplier_invoice" 
            value={filters.supplier_invoice} 
            onChange={handleChange} 
            placeholder="Search by invoice..."
          />
        </div>
      </div>
    </div>
  );
}

export default ProcurementFilters;