import React from 'react';
import './Sidebar.css';

function Sidebar({ setView, currentView, isOpen, onClose }) {
  const handleNavClick = (view) => {
    if (view === 'inventory' || view === 'procurement' || view === 'vendors' || view === 'orders') {
      setView(view);
      onClose();
    }
  };

  const menuSections = [
    {
      title: 'THIRD PARTIES',
      items: [
        { id: 'vendors', label: 'Vendors', icon: '🏢', disabled: false }
      ]
    },
    {
      title: 'INVENTORY AND PROCUREMENT',
      items: [
        { id: 'inventory', label: 'Inventory', icon: '📦', disabled: false },
        { id: 'procurement', label: 'Procurement', icon: '📋', disabled: false }
      ]
    },
    {
      title: 'ORDERS AND PRODUCTION',
      items: [
        { id: 'orders', label: 'Orders', icon: '🛒', disabled: true }
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
                  className={`nav-item ${currentView === item.id ? 'active' : ''} ${item.disabled ? 'disabled' : ''}`}
                  onClick={() => handleNavClick(item.id)}
                  disabled={item.disabled}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
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