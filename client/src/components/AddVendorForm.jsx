import React, { useState } from 'react';


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
    bank_details: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (!formData.company_name.trim()) {
      setErrors({ company_name: 'Company name is required' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        onVendorAdded(data.vendor);
      } else {
        if (data.field) {
          setErrors({ [data.field]: data.message });
        } else {
          setErrors({ general: data.message });
        }
      }
    } catch (error) {
      setErrors({ general: 'Failed to create vendor. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', backgroundColor: 'white', borderRadius: '8px' }}>
      <div className="vendor-form-header">
        <h3>Add New Vendor</h3>
        <p>Create a new vendor record for stone procurement partnerships</p>
      </div>

      <div className="vendor-form-body">
        {errors.general && (
          <div className="vendor-error-message">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Company Information */}
          <div className="vendor-form-section">
            <h4>Company Information</h4>
            
            <div className="vendor-form-row">
              <div className="vendor-form-field vendor-form-field-half">
                <label className="vendor-form-label">Company Name *</label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="Enter company name"
                  className={`vendor-form-input ${errors.company_name ? 'error' : ''}`}
                  required
                />
                {errors.company_name && (
                  <div className="vendor-form-error">
                    {errors.company_name}
                  </div>
                )}
              </div>
              
              <div className="vendor-form-field vendor-form-field-half">
                <label className="vendor-form-label">Contact Person</label>
                <input
                  type="text"
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleChange}
                  placeholder="Enter contact person"
                  className="vendor-form-input"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="vendor-form-section">
            <h4>Contact Information</h4>
            
            <div className="vendor-form-row">
              <div className="vendor-form-field vendor-form-field-half">
                <label className="vendor-form-label">Phone Number</label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  className="vendor-form-input"
                />
              </div>
              
              <div className="vendor-form-field vendor-form-field-half">
                <label className="vendor-form-label">Email Address</label>
                <input
                  type="email"
                  name="email_address"
                  value={formData.email_address}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  className="vendor-form-input"
                />
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="vendor-form-section">
            <h4>Location Information</h4>
            
            <div className="vendor-form-row">
              <div className="vendor-form-field vendor-form-field-half">
                <label className="vendor-form-label">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                  className="vendor-form-input"
                />
              </div>
              
              <div className="vendor-form-field vendor-form-field-half">
                <label className="vendor-form-label">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Enter state"
                  className="vendor-form-input"
                />
              </div>
            </div>

            <div className="vendor-form-row">
              <div className="vendor-form-field vendor-form-field-half">
                <label className="vendor-form-label">State Code</label>
                <input
                  type="text"
                  name="state_code"
                  value={formData.state_code}
                  onChange={handleChange}
                  placeholder="e.g., MH, GJ"
                  className="vendor-form-input"
                />
              </div>
              <div className="vendor-form-field vendor-form-field-half"></div>
            </div>

            <div className="vendor-form-row">
              <div className="vendor-form-field vendor-form-field-full">
                <label className="vendor-form-label">Complete Address</label>
                <textarea
                  name="complete_address"
                  value={formData.complete_address}
                  onChange={handleChange}
                  placeholder="Enter complete address"
                  rows="3"
                  className="vendor-form-input vendor-form-textarea"
                />
              </div>
            </div>
          </div>

          {/* GST & Financial Information */}
          <div className="vendor-form-section">
            <h4>GST & Financial Information</h4>
            
            <div className="vendor-form-row">
              <div className="vendor-form-field vendor-form-field-full">
                <label className="vendor-form-label">GST Number</label>
                <input
                  type="text"
                  name="gst_number"
                  value={formData.gst_number}
                  onChange={handleChange}
                  placeholder="Enter GST number (if applicable)"
                  className={`vendor-form-input ${errors.gst_number ? 'error' : ''}`}
                />
                {errors.gst_number && (
                  <div className="vendor-form-error">
                    {errors.gst_number}
                  </div>
                )}
              </div>
            </div>

            <div className="vendor-form-row">
              <div className="vendor-form-field vendor-form-field-full">
                <label className="vendor-form-label">Bank Details</label>
                <textarea
                  name="bank_details"
                  value={formData.bank_details}
                  onChange={handleChange}
                  placeholder="Enter bank details (Account number, IFSC, bank name, etc.)"
                  rows="3"
                  className="vendor-form-input vendor-form-textarea"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="vendor-form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Creating...' : 'Create Vendor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddVendorForm;