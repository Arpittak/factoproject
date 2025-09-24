import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import VendorsPage from './pages/VendorsPage';
import InventoryPage from './pages/InventoryPage';
import ProcurementPage from './pages/ProcurementPage';

function App() {
  // Get initial view from localStorage or default to 'inventory'
  const [view, setView] = useState(() => {
    return localStorage.getItem('currentView') || 'inventory';
  });

  // Save view to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('currentView', view);
  }, [view]);

  return (
    <Layout setView={setView} currentView={view}>
      {view === 'vendors' && <VendorsPage />}
      {view === 'inventory' && <InventoryPage />}
      {view === 'procurement' && <ProcurementPage />}
    </Layout>
  );
}

export default App;