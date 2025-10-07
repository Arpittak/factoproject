import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Modal from 'react-modal';

// Import all components for this page
import InventoryList from '../components/Inventory/InventoryList';
import ManualAddForm from '../components/Inventory/ManualAddForm';
import AdjustQuantityForm from '../components/Inventory/AdjustQuantityForm';
import TransactionHistoryPage from './TransactionHistoryPage';
import InventoryFilters from '../components/Inventory/InventoryFilters';
import Pagination from '../components/Pagination';
import DashboardBox from '../components/DashboardBox';

// Import the page's stylesheet
import './InventoryPage.css';

const customModalStyles = {
    content: {
      top: '50%', left: '50%', right: 'auto', bottom: 'auto',
      marginRight: '-50%', transform: 'translate(-50%, -50%)', width: '500px',
    },
};
Modal.setAppElement('#root');

function InventoryPage() {
  const [analytics, setAnalytics] = useState(null);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('list');
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isAdjustModalOpen, setAdjustModalOpen] = useState(false);
  const [itemToAdjust, setItemToAdjust] = useState(null);
  const [adjustmentAction, setAdjustmentAction] = useState('add');
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: currentPage, limit, ...filters });
      for (const [key, value] of params.entries()) { if (!value) { params.delete(key); } }
      const response = await axios.get(`/api/inventory?${params.toString()}`);
      setItems(response.data.items);
      setPagination(response.data.pagination);
    } catch (err) { setError('Failed to fetch inventory.'); } 
    finally { setLoading(false); }
  }, [currentPage, limit, filters]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get('/api/inventory/analytics');
        setAnalytics(response.data);
      } catch (err) { console.error("Failed to fetch analytics", err); }
    };
    fetchAnalytics();
  }, []);

  useEffect(() => {
  setView('list');  // Reset to list view when navigating to inventory page
  setSelectedItemId(null);
}, []); // Empty dependency array means this runs once when component mounts

  const handleFilterChange = (newFilters) => { setCurrentPage(1); setFilters(newFilters); };
  const handlePageChange = (newPage) => { setCurrentPage(newPage); };
  const handleLimitChange = (newLimit) => { setCurrentPage(1); setLimit(newLimit); };
  const handleItemAdded = () => { setAddModalOpen(false); fetchItems(); };
  const openAddModal = () => setAddModalOpen(true);
  const closeAddModal = () => setAddModalOpen(false);
  const showHistory = (itemId) => { setSelectedItemId(itemId); setView('history'); };
  const showList = () => { setView('list'); setSelectedItemId(null); fetchItems(); };
  const openAdjustModal = (item, action) => { setItemToAdjust(item); setAdjustmentAction(action); setAdjustModalOpen(true); };
  const closeAdjustModal = () => { setAdjustModalOpen(false); setItemToAdjust(null); };

  // Clear filters function
  const handleClearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(value => value !== '');

 const handleAdjustSubmit = async (quantity, unit, reason) => {
  const inputQuantity = parseFloat(quantity);
  const finalQuantity = adjustmentAction === 'add' ? inputQuantity : -inputQuantity;
  
  const payload = { 
    inventory_item_id: itemToAdjust.id, 
    quantity: finalQuantity,
    unit, 
    reason 
  };
  
  try {
    const response = await fetch('/api/inventory/manual-adjust', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to adjust quantity');
    }
    
    closeAdjustModal();
    fetchItems();
  } catch (err) { 
    alert(err.message || 'Failed to adjust quantity.'); 
  }
};

  const handleDelete = async (item) => {
    if (window.confirm(`PERMANENTLY DELETE "${item.stone_name}" and all its history? This cannot be undone.`)) {
      try {
        await axios.delete(`/api/inventory/${item.id}`);
        fetchItems();
      } catch (err) { alert('Failed to delete item.'); }
    }
  };

  const toggleFiltersVisibility = () => {
    setFiltersVisible(!filtersVisible);
  };

  return (
    <div>
      {view === 'list' && (
        <>
          <div className="page-header">
            <div className="page-header-content">
              <h2>Inventory</h2>
              <p>Track materials at any stage in the processing pipeline</p>
            </div>
            <div className="page-header-actions">
              <button onClick={openAddModal} className="btn-primary">+ Add Item</button>
            </div>
          </div>

          <div className="dashboard-container">
            {analytics ? (
              <>
                <DashboardBox title="Total Items" value={analytics.totalItems} subtitle="Items in inventory" icon="📦" />
                <DashboardBox title="Raw Materials" value={analytics.rawMaterials} subtitle="Awaiting processing" icon="🧱" />
                <DashboardBox title="Finished Items" value={analytics.packagingComplete} subtitle="Ready for dispatch" icon="✅" />
                <div className="dashboard-box">
                    <div className="box-content">
                        <p className="box-title">Total Quantity</p>
                        <h3 className="box-value">{parseFloat(analytics.totalQuantity?.sqMeter || 0).toFixed(2)} Sq Meter</h3>
                        <h3 className="box-value">{analytics.totalQuantity?.pieces || 0} Pieces</h3>
                    </div>
                </div>
              </>
            ) : <p>Loading analytics...</p>}
          </div>

          <div className="inventory-items-container">
            <div className="inventory-items-header">
                <h4>📋 Inventory Items</h4>
            </div>
            
            {/* Updated filters header with clear button */}
            <div className="filters-header" onClick={toggleFiltersVisibility} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <h4 style={{ margin: 0 }}>
                  <span style={{marginRight: '10px'}}>🔍</span>
                  Filters
                  {hasActiveFilters && (
                    <span style={{
                      background: '#007bff',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '500',
                      marginLeft: '8px'
                    }}>
                      ({Object.values(filters).filter(v => v !== '').length})
                    </span>
                  )}
                </h4>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {hasActiveFilters && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearFilters();
                    }} 
                    style={{
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                  >
                    Clear Filters
                  </button>
                )}
                <span 
                  className="filters-header-arrow" 
                  style={{ 
                    transform: filtersVisible ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    fontSize: '12px',
                    color: '#666'
                  }}
                >
                  ▼
                </span>
              </div>
            </div>

            {filtersVisible && (
              <div className="filters-content">
                <InventoryFilters onFilterChange={handleFilterChange} currentFilters={filters} />
              </div>
            )}
            
            {loading ? <p>Loading...</p> : !error && (
              <>
                <InventoryList 
                    items={items} 
                    onShowHistory={showHistory} 
                    onAdjust={openAdjustModal}
                    onDelete={handleDelete}
                />
                <Pagination 
                  pagination={pagination} 
                  onPageChange={handlePageChange}
                  itemsPerPage={limit}
                  onLimitChange={handleLimitChange}
                />
              </>
            )}
            {error && <p>{error}</p>}
          </div>

          <Modal isOpen={isAddModalOpen} onRequestClose={closeAddModal} style={customModalStyles}>
            <ManualAddForm onItemAdded={handleItemAdded} onCancel={closeAddModal} />
          </Modal>
          {itemToAdjust && (
            <Modal isOpen={isAdjustModalOpen} onRequestClose={closeAdjustModal} style={customModalStyles}>
                <AdjustQuantityForm 
                    item={itemToAdjust}
                    action={adjustmentAction}
                    onAdjust={handleAdjustSubmit}
                    onCancel={closeAdjustModal}
                />
            </Modal>
          )}
        </>
      )}
      {view === 'history' && (
        <TransactionHistoryPage itemId={selectedItemId} onBack={showList} />
      )}
    </div>
  );
}

export default InventoryPage;