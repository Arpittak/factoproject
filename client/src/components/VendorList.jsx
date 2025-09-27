import React from "react";
import './VendorList.css';

function VendorList({ vendors }) {
  if (!vendors || vendors.length === 0) {
    return (
      <div className="no-results">
        <p>No vendors found matching the current filters.</p>
      </div>
    );
  }

  return (
    <div className="vendors-table-container">
      <table className="vendors-table">
        <thead>
          <tr>
            <th>Company Name</th>
            <th>Contact Person</th>
            <th>Phone</th>
            <th>Email</th>
            <th>City</th>
            <th>State</th>
            <th>GST</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map((vendor) => (
            <tr key={vendor.id} className="vendor-row">
              <td className="company-cell">
                <div className="company-info">
                  <strong className="company-name">
                    {vendor.company_name}
                  </strong>
                </div>
              </td>
              <td className="contact-cell">{vendor.contact_person || "-"}</td>
              <td className="phone-cell">{vendor.phone_number || "-"}</td>
              <td className="email-cell">{vendor.email_address || "-"}</td>
              <td className="city-cell">{vendor.city || "-"}</td>
              <td className="state-cell">{vendor.state || "-"}</td>
              <td className="gst-cell">
                {vendor.gst_number ? (
                  <span className="gst-badge">GST</span>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default VendorList;
