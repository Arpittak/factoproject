import React from 'react';
import './Header.css';

function Header({ toggleSidebar }) {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-toggle" onClick={toggleSidebar}>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
        <div className="header-logo">
          <span className="header-logo-text">FACTO</span>
          <span className="header-logo-subtitle">Stone Processing System</span>
        </div>
      </div>
      
      <div className="header-right">
        <div className="header-actions">
          <button className="header-action-btn" onClick={handleRefresh} title="Refresh Page">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
            </svg>
          </button>
          
          <div className="user-profile">
            <div className="user-avatar-header">FA</div>
            <div className="user-info-header">
              <div className="user-name-header">Admin</div>
              <div className="user-status">Online</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;