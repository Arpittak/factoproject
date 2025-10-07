import React, { useState, useEffect } from 'react';

const initialFilters = {
  company_name: '',
  contact_person: '',
  phone_number: '',
  email_address: '',
  state: '',
  gst_status: ''
};

function VendorFilters({ onFilterChange, currentFilters = {} }) {
  const [filters, setFilters] = useState(currentFilters);

  // State for dropdown options
  const [states, setStates] = useState([]);

  // Update local filters when currentFilters prop changes (for clearing)
  useEffect(() => {
    setFilters(currentFilters);
  }, [currentFilters]);

  // Fetch unique states from vendors
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await fetch('/api/vendors/states');
        const data = await response.json();
        setStates(data);
      } catch (error) {
        console.error("Failed to fetch states", error);
      }
    };
    fetchStates();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="form-section" style={{border: 'none', padding: '0'}}>
      <div className="fields-row">
        <div className="field-container" style={{ width: '20%' }}>
          <label>Company Name</label>
          <input 
            type="text" 
            className="form-input" 
            name="company_name" 
            value={filters.company_name} 
            onChange={handleChange} 
            placeholder="Search by company..."
          />
        </div>

        <div className="field-container" style={{ width: '20%' }}>
          <label>Contact Person</label>
          <input 
            type="text" 
            className="form-input" 
            name="contact_person" 
            value={filters.contact_person} 
            onChange={handleChange} 
            placeholder="Search by contact..."
          />
        </div>

        <div className="field-container" style={{ width: '15%' }}>
          <label>Phone</label>
          <input 
            type="text" 
            className="form-input" 
            name="phone_number" 
            value={filters.phone_number} 
            onChange={handleChange} 
            placeholder="Phone number..."
          />
        </div>

        <div className="field-container" style={{ width: '20%' }}>
          <label>Email</label>
          <input 
            type="text" 
            className="form-input" 
            name="email_address" 
            value={filters.email_address} 
            onChange={handleChange} 
            placeholder="Search by email..."
          />
        </div>

        <div className="field-container" style={{ width: '12%' }}>
          <label>State</label>
          <select className="form-input" name="state" value={filters.state} onChange={handleChange}>
            <option value="">All States</option>
            {states.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
        
        <div className="field-container" style={{ width: '13%' }}>
          <label>GST Status</label>
          <select className="form-input" name="gst_status" value={filters.gst_status} onChange={handleChange}>
            <option value="">All</option>
            <option value="has_gst">Has GST</option>
            <option value="no_gst">No GST</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default VendorFilters;