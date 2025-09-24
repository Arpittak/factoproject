import React, { useState } from 'react';
import axios from 'axios';

const inputStyle = {
  display: 'block',
  margin: '10px 0',
  padding: '8px',
  width: '95%', // Make it responsive inside the modal
};

function AddVendorForm({ onVendorAdded, onCancel }) {
  const [formData, setFormData] = useState({
    company_name: '',
    contact_person: '',
    phone_number: '',
    email_address: '',
    city: '',
    state: '',
    state_code: '',
    complete_address: '',
    gst_number: '',
    bank_details: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/vendors', formData);
      onVendorAdded(response.data);
    } catch (error) {
      console.error('Failed to add vendor:', error);
      alert('Failed to add vendor.');
    }
  };

  return (
    <div>
      <h3>Add New Vendor</h3>
      <form onSubmit={handleSubmit}>
        <input style={inputStyle} type="text" name="company_name" value={formData.company_name} onChange={handleChange} placeholder="Company Name" required />
        <input style={inputStyle} type="text" name="contact_person" value={formData.contact_person} onChange={handleChange} placeholder="Contact Person" required />
        <input style={inputStyle} type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="Phone Number" />
        <input style={inputStyle} type="email" name="email_address" value={formData.email_address} onChange={handleChange} placeholder="Email Address" />
        <input style={inputStyle} type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" />
        <input style={inputStyle} type="text" name="state" value={formData.state} onChange={handleChange} placeholder="State" />
        <input style={inputStyle} type="text" name="gst_number" value={formData.gst_number} onChange={handleChange} placeholder="GST Number" />
        <textarea style={inputStyle} name="complete_address" value={formData.complete_address} onChange={handleChange} placeholder="Complete Address" />
        
        <div style={{ marginTop: '20px' }}>
          <button type="submit">Add Vendor</button>
          <button type="button" onClick={onCancel} style={{ marginLeft: '10px' }}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default AddVendorForm;