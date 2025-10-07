import React from 'react';
import './DashboardBox.css'; // Import the new stylesheet

function DashboardBox({ title, value, subtitle, icon }) {
  return (
    <div className="dashboard-box">
      <div className="box-content">
        <p className="box-title">{title}</p>
        <h3 className="box-value">{value}</h3>
        <p className="box-subtitle">{subtitle}</p>
      </div>
      <div className="box-icon">
        {icon}
      </div>
    </div>
  );
}

export default DashboardBox;

