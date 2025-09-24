import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Modal from 'react-modal';

import ProcurementList from '../components/ProcurementList';
import AddProcurementForm from '../components/AddProcurementForm';
import DashboardBox from '../components/DashboardBox';
import ProcurementFilters from '../components/ProcurementFilters';
import Pagination from '../components/Pagination';
import ProcurementDetailsPage from './ProcurementDetailsPage';

import './InventoryPage.css';

const customModalStyles = {
    content: {
      top: '50%', left: '50%', right: 'auto', bottom: 'auto',
      marginRight: '-50%', transform: 'translate(-50%, -50%)', width: '700px',
    },
};
Modal.setAppElement('#root');

function ProcurementPage() {
  const [procurements, setProcurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [view, setView] = useState('list');
  const [selectedProcurementId, setSelectedProcurementId] = useState(null);



  const fetchProcurements = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: currentPage, limit, ...filters });
      // Remove empty filters from params
      for (const [key, value] of params.entries()) {
        if (!value) {
          params.delete(key);
        }
      }

      const [procResponse, analyticsResponse] = await Promise.all([
        axios.get(`/api/procurements?${params.toString()}`),
        axios.get('/api/procurements/analytics')
      ]);
      
      setProcurements(procResponse.data.procurements);
      setPagination(procResponse.data.pagination);
      setAnalytics(analyticsResponse.data);
    } catch (error) {
      console.error("Failed to fetch procurements data", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, filters]);

  useEffect(() => {
    fetchProcurements();
  }, [fetchProcurements]);

  const handleFilterChange = (newFilters) => {
    setCurrentPage(1);
    setFilters(newFilters);
  };
  
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };
  
  const handleLimitChange = (newLimit) => {
    setCurrentPage(1);
    setLimit(newLimit);
  };
  
  const handleProcurementAdded = () => {
    closeModal();
    fetchProcurements();
  };
  
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Clear filters function
  const handleClearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  const toggleFiltersVisibility = () => {
    setFiltersVisible(!filtersVisible);
  };


const showDetails = (procurementId) => { 
  console.log('showDetails called with ID:', procurementId);
  console.log('Current view before change:', view); // Add this line
  setSelectedProcurementId(procurementId); 
  setView('details');
  console.log('View should now be: details'); // Add this line
};

const showList = () => { 
  setView('list'); 
  setSelectedProcurementId(null); 
  fetchProcurements(); 
};

console.log('Current view state:', view, 'Selected ID:', selectedProcurementId);



  return (
    
    <div>
    {view === 'list' && (
      <>
        <div className="page-header">
          <div className="page-header-content">
            <h2>Procurement</h2>
            <p>Manage material procurement and vendor sourcing workflow</p>
          </div>
          <div className="page-header-actions">
            <button onClick={openModal} className="btn-primary">+ New Procurement</button>
          </div>
        </div>

        <div className="dashboard-container">
          {analytics ? (
            <>
              <DashboardBox title="Total Procurements" value={analytics.totalProcurements} subtitle="All procurement records" icon="📄" />
              <DashboardBox title="Total Stones" value={analytics.totalStones} subtitle="All stone items procured" icon="💎" />
              <DashboardBox title="Unique Vendors" value={analytics.uniqueVendors} subtitle="Active suppliers" icon="👥" />
              <DashboardBox title="Total Value" value={`₹${parseFloat(analytics.totalValue || 0).toLocaleString('en-IN')}`} subtitle="All procurement costs" icon="💰" />
            </>
          ) : <p>Loading analytics...</p>}
        </div>
        
        <div className="inventory-items-container">
          <div className="inventory-items-header">
            <h4>📋 Procurement Records</h4>
          </div>
        
        {/* Filters header with clear button - exactly like inventory */}
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
              <ProcurementFilters onFilterChange={handleFilterChange} currentFilters={filters} />
            </div>
          )}
          
          {loading ? <p>Loading records...</p> : (
            <>
              <ProcurementList 
                procurements={procurements}   
                onShowDetails={showDetails} 
              />
              <Pagination 
                pagination={pagination}
                onPageChange={handlePageChange}
                itemsPerPage={limit}
                onLimitChange={handleLimitChange}
              />
            </>
          )}
        </div>

        <Modal isOpen={isModalOpen} onRequestClose={closeModal} style={customModalStyles}>
          <AddProcurementForm onProcurementAdded={handleProcurementAdded} onCancel={closeModal} />
        </Modal>
      </>
    )}

    {view === 'details' && (
      <ProcurementDetailsPage 
        procurementId={selectedProcurementId} 
        onBack={showList} 
      />
    )}
  </div>
);
}

export default ProcurementPage;