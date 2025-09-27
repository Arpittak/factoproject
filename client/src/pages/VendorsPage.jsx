import React, { useState, useEffect, useCallback } from 'react';
import DashboardBox from '../components/DashboardBox';
import Pagination from '../components/Pagination';
import VendorList from '../components/VendorList';
import AddVendorForm from '../components/AddVendorForm';
import VendorFilters from '../components/VendorFilters';
import './InventoryPage.css';

function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  
  // Analytics state
  const [analytics, setAnalytics] = useState({
    totalVendors: 0,
    activeVendors: 0,
    stateCount: 0,
    gstRegistered: 0
  });

  // Filter and pagination state
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState(null);

  // Fetch vendors with pagination and filters
  const fetchVendors = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: currentPage, limit, ...filters });
      
      // Remove empty filter values
      for (const [key, value] of params.entries()) {
        if (!value) { params.delete(key); }
      }

      const response = await fetch(`/api/vendors?${params.toString()}`);
      const data = await response.json();
      
      setVendors(data.vendors || data.items || []);
      setPagination(data.pagination);
    } catch (err) {
      setError('Failed to fetch vendors.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, filters]);

  // Fetch analytics
  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch('/api/vendors/analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      console.error("Failed to fetch vendor analytics", err);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showAddForm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to reset overflow when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showAddForm]);

  // Event handlers
  const handleFilterChange = (newFilters) => {
    setCurrentPage(1);
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleLimitChange = (newLimit) => {
    setCurrentPage(1);
    setLimit(newLimit);
  };

  const handleVendorAdded = (newVendor) => {
    setVendors([newVendor, ...vendors]);
    setShowAddForm(false);
    fetchAnalytics(); // Update analytics
  };

  const toggleFiltersVisibility = () => {
    setFiltersVisible(!filtersVisible);
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="vendors-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-content">
          <h2>Vendors</h2>
          <p>Manage supplier relationships and stone procurement contracts</p>
        </div>
        <div className="page-header-actions">
          <button onClick={() => setShowAddForm(true)} className="btn-primary">
            + Add Vendor
          </button>
        </div>
      </div>

      {/* Dashboard Analytics */}
      <div className="dashboard-container">
        <DashboardBox 
          title="Total Vendors" 
          value={analytics.totalVendors} 
          subtitle="Synced to system" 
          icon="👥" 
        />
        <DashboardBox 
          title="Active Vendors" 
          value={analytics.activeVendors} 
          subtitle="Currently active" 
          icon="✅" 
        />
        <DashboardBox 
          title="States" 
          value={analytics.stateCount} 
          subtitle="Geographic reach" 
          icon="📍" 
        />
        <DashboardBox 
          title="GST Registered" 
          value={analytics.gstRegistered} 
          subtitle="Tax compliance" 
          icon="📋" 
        />
      </div>

      {/* Add Vendor Modal */}
      {showAddForm && (
        <div 
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddForm(false);
            }
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050,
            padding: '20px',
            overflowY: 'auto'
          }}
        >
          <div 
            style={{
              maxHeight: '90vh',
              overflowY: 'auto',
              width: '100%',
              maxWidth: '700px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <AddVendorForm
              onVendorAdded={handleVendorAdded}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        </div>
      )}

      {/* Vendors List Container */}
      <div className="inventory-items-container">
        <div className="inventory-items-header">
          <h4>📋 All Vendors</h4>
        </div>

        {/* Filters Header */}
        <div className="filters-header" onClick={toggleFiltersVisibility}>
          <h4>
            🔍 Filters
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
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {hasActiveFilters && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearFilters();
                }} 
                className="btn-danger"
                style={{ fontSize: '11px', padding: '4px 8px' }}
              >
                Clear Filters
              </button>
            )}
            <span 
              className="filters-header-arrow"
              style={{
                transform: filtersVisible ? 'rotate(180deg)' : 'rotate(0deg)'
              }}
            >
              ▼
            </span>
          </div>
        </div>

        {/* Filters Content */}
        {filtersVisible && (
          <div className="filters-content">
            <VendorFilters 
              onFilterChange={handleFilterChange} 
              currentFilters={filters} 
            />
          </div>
        )}

        {/* Loading, Error, or Vendor List */}
        {loading ? (
          <div className="loading-text">Loading vendors...</div>
        ) : error ? (
          <div className="error-text">{error}</div>
        ) : (
          <>
            <VendorList vendors={vendors} />
            <Pagination 
              pagination={pagination} 
              onPageChange={handlePageChange}
              itemsPerPage={limit}
              onLimitChange={handleLimitChange}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default VendorsPage;