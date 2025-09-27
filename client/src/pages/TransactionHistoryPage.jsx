import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TransactionFilters from '../components/TransactionFilters';
// --- Reusable styles for this page ---

// Replace pageHeaderStyle
const pageHeaderStyle = { 
  display: 'flex', 
  flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
  justifyContent: 'space-between', 
  alignItems: window.innerWidth <= 768 ? 'flex-start' : 'center',
  marginBottom: '20px',
  gap: window.innerWidth <= 768 ? '10px' : '0'
};

// Replace detailsBoxStyle  
const detailsBoxStyle = { 
  border: '1px solid #eee', 
  padding: '20px', 
  borderRadius: '8px', 
  display: 'grid',
  gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(4, 1fr)',
  gap: window.innerWidth <= 768 ? '16px' : '20px',
  backgroundColor: '#fff', 
  marginBottom: '20px' 
};

// Update detailItemStyle
const detailItemStyle = { 
  textAlign: window.innerWidth <= 768 ? 'left' : 'center',
  padding: window.innerWidth <= 768 ? '12px' : '0',
  borderBottom: window.innerWidth <= 768 ? '1px solid #eee' : 'none'
};
const backButtonStyle = { padding: '8px 15px', cursor: 'pointer', border: '1px solid #ccc', background: '#fff', borderRadius: '5px' };

const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '20px' };
const thStyle = { padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd', backgroundColor: '#f8f9fa' };
const tdStyle = { padding: '10px', borderBottom: '1px solid #ddd', verticalAlign: 'top' };

function TransactionHistoryPage({ itemId, onBack }) {
  const [itemDetails, setItemDetails] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [currentFilters, setCurrentFilters] = useState({});

  // Function to format transaction type for display
  const formatTransactionType = (transactionType) => {
    const typeMap = {
      'procurement_initial_stock': 'Initial Stock',
      'procurement_quantity_added': 'Added Stock',
      'procurement_item_deleted': 'Deleted Item',
      'manual_add': 'Manual Add',
      'manual_remove': 'Manual Remove',
      'sale': 'Sale',
      'wastage': 'Wastage'
    };
    return typeMap[transactionType] || transactionType;
  };

  // Function to get transaction type badge color
  const getTransactionTypeBadge = (transactionType) => {
    const colorMap = {
      'procurement_initial_stock': '#007bff',
      'procurement_quantity_added': '#007bff', 
      'procurement_item_deleted': '#dc3545',
      'manual_add': '#28a745',
      'manual_remove': '#ffc107',
      'sale': '#6f42c1',
      'wastage': '#fd7e14'
    };
    
    const color = colorMap[transactionType] || '#6c757d';
    
    return (
      <span style={{
        padding: '2px 6px',
        borderRadius: '12px',
        fontSize: '10px',
        fontWeight: '500',
        color: 'white',
        backgroundColor: color,
        display: 'inline-block',
        marginBottom: '4px'
      }}>
        {formatTransactionType(transactionType)}
      </span>
    );
  };

  const handleFilterChange = (filters) => {
    setCurrentFilters(filters);
    let filtered = [...history];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(tx => 
        (tx.reason && tx.reason.toLowerCase().includes(filters.search.toLowerCase())) ||
        (tx.source_details && tx.source_details.toLowerCase().includes(filters.search.toLowerCase())) ||
        tx.performed_by.toLowerCase().includes(filters.search.toLowerCase()) ||
        formatTransactionType(tx.transaction_type).toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Transaction type filter
    if (filters.transactionType) {
      filtered = filtered.filter(tx => 
        filters.transactionType === 'add' ? tx.change_in_pieces > 0 : tx.change_in_pieces < 0
      );
    }

    // User filter
    if (filters.user) {
      filtered = filtered.filter(tx => tx.performed_by === filters.user);
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      if (filters.sortBy === 'date') {
        comparison = new Date(a.created_at) - new Date(b.created_at);
      } else if (filters.sortBy === 'amount') {
        comparison = Math.abs(a.change_in_pieces) - Math.abs(b.change_in_pieces);
      }
      return filters.order === 'newest' ? -comparison : comparison;
    });

    setFilteredHistory(filtered);
  };

  useEffect(() => {
    const fetchHistory = async () => {
      if (!itemId) return;
      try {
        setLoading(true);
        // Using fetch instead of axios for artifact compatibility
        const response = await fetch(`/api/inventory/${itemId}/transactions`);
        const data = await response.json();
        setItemDetails(data.item);
        setHistory(data.history);
        setFilteredHistory(data.history);
      } catch (err) {
        setError('Failed to fetch transaction history.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [itemId]);

  if (loading) return <p>Loading history...</p>;
  if (error) return <p>{error}</p>;
  if (!itemDetails) return <p>Item not found.</p>;

  return (
    <div>
      
      <div style={pageHeaderStyle}>
        <div>
          <button style={backButtonStyle} onClick={onBack}>&larr; Back</button>
          <h2 style={{ display: 'inline-block', marginLeft: '20px' }}>Transaction History</h2>
          <p style={{ color: '#555', margin: '0 0 0 22px' }}>{itemDetails.stone_type} - {itemDetails.stone_name}</p>
        </div>
      </div>

      {/* --- Item Details Box --- */}
      <div style={detailsBoxStyle}>
        <div style={detailItemStyle}>
            <strong>Dimensions</strong>
            <p>{`${itemDetails.length_mm} x ${itemDetails.width_mm} x ${itemDetails.thickness_mm || 'N/A'} mm`}</p>
        </div>
        <div style={detailItemStyle}>
            <strong>Stage</strong>
            <p>{itemDetails.stage}</p>
        </div>
        <div style={detailItemStyle}>
            <strong>Current Quantity</strong>
            <p>
                <strong>{history.length > 0 ? `${history[0].balance_after_pieces} Pieces` : '0 Pieces'}</strong><br/>
                <small>{history.length > 0 ? `${parseFloat(history[0].balance_after_sq_meter).toFixed(2)} Sq Meter` : '0.00 Sq Meter'}</small>
            </p>
        </div>
         <div style={detailItemStyle}>
            <strong>Total Transactions</strong>
            <p>{history.length}</p>
        </div>
      </div>

      <TransactionFilters onFilterChange={handleFilterChange} />

      {/* --- Transaction History Table --- */}
      <div style={{
        overflowX: 'auto',
        border: '1px solid #eee',
        borderRadius: '8px',
        backgroundColor: '#fff'
      }}>
        <table style={{
          ...tableStyle,
          minWidth: '800px' // Back to original width
        }}>
          <thead>
            <tr>
              <th style={thStyle}>Date & Time</th>
              <th style={thStyle}>Quantity (in/out)</th>
              <th style={thStyle}>Change (Pieces/Sq Meter)</th>
              <th style={thStyle}>Balance After</th>
              <th style={thStyle}>Reason</th>
              <th style={thStyle}>Performed By</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.map((tx) => (
              <tr key={tx.id}>
                <td style={tdStyle}>{new Date(tx.created_at).toLocaleString()}</td>
                <td style={tdStyle}>
                  <span style={{ 
                    color: tx.change_in_pieces > 0 ? '#28a745' : '#dc3545', 
                    backgroundColor: tx.change_in_pieces > 0 ? '#e9f7eb' : '#fbe9eb',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontWeight: 'bold' 
                  }}>
                    {tx.change_in_pieces > 0 ? `+${tx.change_in_pieces}` : tx.change_in_pieces} Pieces
                  </span>
                </td>
                <td style={tdStyle}>
                  <strong>{Math.abs(tx.change_in_pieces)} Pieces</strong><br/>
                  <small>{parseFloat(Math.abs(tx.change_in_sq_meter)).toFixed(2)} Sq Meter</small>
                </td>
                <td style={tdStyle}>
                  <strong>{tx.balance_after_pieces} Pieces</strong><br/>
                  <small>{parseFloat(tx.balance_after_sq_meter).toFixed(2)} Sq Meter</small>
                </td>
                <td style={tdStyle}>
                  <div style={{ fontSize: '13px' }}>
                    {/* Transaction Type - Simple Text Only */}
                    <div style={{ 
                      fontWeight: 'bold', 
                      color: '#333',
                      marginBottom: '6px'
                    }}>
                      {formatTransactionType(tx.transaction_type)}
                    </div>
                    
                    {/* System Comment Label - Only show if there's reason or source_details */}
                    {(tx.reason || tx.source_details) && (
                      <div style={{ 
                        fontSize: '11px', 
                        color: '#666', 
                        fontWeight: '500',
                        marginBottom: '4px'
                      }}>
                        System Comment
                      </div>
                    )}
                    
                    {/* Source/Reason Data */}
                    {tx.reason && (
                      <div style={{ marginBottom: '2px', color: '#333' }}>
                        {tx.reason}
                      </div>
                    )}
                    {tx.source_details && (
                      <div style={{ color: '#666' }}>
                        {tx.source_details}
                      </div>
                    )}
                  </div>
                </td>
                <td style={tdStyle}>{tx.performed_by}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TransactionHistoryPage;