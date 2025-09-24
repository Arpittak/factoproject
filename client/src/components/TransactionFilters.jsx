import React, { useState } from 'react';

function TransactionFilters({ onFilterChange, onSortChange, onPageSizeChange }) {
  const [filters, setFilters] = useState({
    search: '',
    transactionType: '',
    user: '',
    sortBy: 'date',
    order: 'newest',
    itemsPerPage: 10
  });

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div style={{
  background: 'white',
  padding: '16px',
  borderRadius: '8px',
  border: '1px solid #e9ecef',
  marginBottom: '20px'
}}>
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
    alignItems: 'end'
  }}>
    {/* Search */}
    <div style={{ gridColumn: 'span 2' }}>
      <label style={{ fontSize: '12px', color: 'black', opacity: '0.7', display: 'block', marginBottom: '4px' }}>
        Search
      </label>
      <input
        type="text"
        placeholder="Search reason or user..."
        value={filters.search}
        onChange={(e) => handleFilterChange('search', e.target.value)}
        style={{
          width: '100%',
          padding: '8px 12px',
          border: '1px solid #e9ecef',
          borderRadius: '4px',
          fontSize: '14px',
          boxSizing: 'border-box'
        }}
      />
    </div>

    {/* Transaction Type */}
    <div>
      <label style={{ fontSize: '12px', color: 'black', opacity: '0.7', display: 'block', marginBottom: '4px' }}>
        Transaction Type
      </label>
      <select
        value={filters.transactionType}
        onChange={(e) => handleFilterChange('transactionType', e.target.value)}
        style={{
          width: '100%',
          padding: '8px 12px',
          border: '1px solid #e9ecef',
          borderRadius: '4px',
          fontSize: '14px',
          boxSizing: 'border-box'
        }}
      >
        <option value="">All Types</option>
        <option value="add">Add</option>
        <option value="remove">Remove</option>
      </select>
    </div>

    {/* User */}
    <div>
      <label style={{ fontSize: '12px', color: 'black', opacity: '0.7', display: 'block', marginBottom: '4px' }}>
        User
      </label>
      <select
        value={filters.user}
        onChange={(e) => handleFilterChange('user', e.target.value)}
        style={{
          width: '100%',
          padding: '8px 12px',
          border: '1px solid #e9ecef',
          borderRadius: '4px',
          fontSize: '14px',
          boxSizing: 'border-box'
        }}
      >
        <option value="">All Users</option>
        <option value="System">System</option>
        <option value="Facto Test">Facto Test</option>
      </select>
    </div>

    {/* Sort By */}
    <div>
      <label style={{ fontSize: '12px', color: 'black', opacity: '0.7', display: 'block', marginBottom: '4px' }}>
        Sort By
      </label>
      <select
        value={filters.sortBy}
        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
        style={{
          width: '100%',
          padding: '8px 12px',
          border: '1px solid #e9ecef',
          borderRadius: '4px',
          fontSize: '14px',
          boxSizing: 'border-box'
        }}
      >
        <option value="date">Date</option>
        <option value="amount">Amount</option>
      </select>
    </div>

    {/* Order */}
    <div>
      <label style={{ fontSize: '12px', color: 'black', opacity: '0.7', display: 'block', marginBottom: '4px' }}>
        Order
      </label>
      <select
        value={filters.order}
        onChange={(e) => handleFilterChange('order', e.target.value)}
        style={{
          width: '100%',
          padding: '8px 12px',
          border: '1px solid #e9ecef',
          borderRadius: '4px',
          fontSize: '14px',
          boxSizing: 'border-box'
        }}
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
      </select>
    </div>

    {/* Items per Page */}
    <div>
      <label style={{ fontSize: '12px', color: 'black', opacity: '0.7', display: 'block', marginBottom: '4px' }}>
        Items per Page
      </label>
      <select
        value={filters.itemsPerPage}
        onChange={(e) => handleFilterChange('itemsPerPage', parseInt(e.target.value))}
        style={{
          width: '100%',
          padding: '8px 12px',
          border: '1px solid #e9ecef',
          borderRadius: '4px',
          fontSize: '14px',
          boxSizing: 'border-box'
        }}
      >
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={25}>25</option>
        <option value={50}>50</option>
      </select>
    </div>
  </div>

  {/* Mobile responsive styles */}
  <style jsx>{`
    @media (max-width: 768px) {
      div[style*="gridTemplateColumns"] {
        grid-template-columns: 1fr !important;
        gap: 8px !important;
      }
      div[style*="gridColumn"] {
        grid-column: span 1 !important;
      }
    }
  `}</style>
</div>
  );
}

export default TransactionFilters;