import React from 'react';
import './Pagination.css';

function Pagination({ pagination, onPageChange, itemsPerPage, onLimitChange }) {
  if (!pagination || pagination.totalItems === 0) {
    return <div className="pagination-container">No results found.</div>;
  }
  
  const { currentPage, totalPages, totalItems } = pagination;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(startItem + itemsPerPage - 1, totalItems);

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="pagination-container">
      {/* --- "Show X entries" Dropdown --- */}
      <div className="pagination-limit-control">
        <span>Show</span>
        <select value={itemsPerPage} onChange={(e) => onLimitChange(Number(e.target.value))}>
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span>entries</span>
      </div>

      {/* --- "Showing X to Y of Z results" text --- */}
      <div className="pagination-info">
        Showing {startItem} to {endItem} of {totalItems} results
      </div>

      {/* --- Page number controls --- */}
      <div className="pagination-controls">
        <button onClick={() => onPageChange(1)} disabled={currentPage === 1}>&laquo;</button>
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>&lt;</button>
        {pageNumbers.map(number => (
          <button 
            key={number} 
            onClick={() => onPageChange(number)}
            className={currentPage === number ? 'active' : ''}
          >
            {number}
          </button>
        ))}
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>&gt;</button>
        <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}>&raquo;</button>
      </div>
    </div>
  );
}

export default Pagination;

