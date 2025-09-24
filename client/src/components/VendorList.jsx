import React from 'react';

function VendorList({ vendors }) {
  if (!vendors || vendors.length === 0) {
    return <p>No vendors found.</p>;
  }

  const thStyle = { padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' };
  const tdStyle = { padding: '10px', borderBottom: '1px solid #ddd' };

  return (
    <div>
      <h2>Vendors</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={thStyle}>Company Name</th>
            <th style={thStyle}>Contact Person</th>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>City</th>
            <th style={thStyle}>State</th>
            <th style={thStyle}>GST Number</th>
          </tr>
        </thead>
        <tbody>{vendors.map((vendor) => (
            <tr key={vendor.id}>
              <td style={tdStyle}>{vendor.company_name}</td>
              <td style={tdStyle}>{vendor.contact_person}</td>
              <td style={tdStyle}>{vendor.email_address}</td>
              <td style={tdStyle}>{vendor.city}</td>
              <td style={tdStyle}>{vendor.state}</td>
              <td style={tdStyle}>{vendor.gst_number}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default VendorList;