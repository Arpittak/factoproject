import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (path) => {
    navigate(path);
    onClose();
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const menuSections = [
    {
      title: 'THIRD PARTIES',
      items: [
        { id: 'vendors', label: 'Vendors', icon: '🏢', path: '/vendors', disabled: false },
        { id: 'vendor-procurement', label: 'Vendor Procurement', icon: '📊', path: '/vendor-procurement', disabled: false }
      ]
    },
    {
      title: 'INVENTORY AND PROCUREMENT',
      items: [
        { id: 'inventory', label: 'Inventory', icon: '📦', path: '/inventory', disabled: false },
        { id: 'procurement', label: 'Procurement', icon: '📋', path: '/procurements', disabled: false }
      ]
    },
    {
      title: 'ORDERS AND PRODUCTION',
      items: [
        { id: 'orders', label: 'Orders', icon: '🛒', path: '/orders', disabled: true }
      ]
    }
  ];

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <button className="sidebar-close" onClick={onClose}>×</button>
        </div>
        
        <nav className="sidebar-nav">
          {menuSections.map((section) => (
            <div key={section.title} className="nav-section">
              <div className="section-title">{section.title}</div>
              {section.items.map((item) => (
                <button
                  key={item.id}
                  className={`nav-item ${isActive(item.path) ? 'active' : ''} ${item.disabled ? 'disabled' : ''}`}
                  onClick={() => !item.disabled && handleNavClick(item.path)}
                  disabled={item.disabled}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  {item.disabled && <span className="coming-soon">Soon</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;