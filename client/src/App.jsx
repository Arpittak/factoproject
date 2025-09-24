  import React, { useState } from 'react';
  import Layout from './components/Layout';
  import VendorsPage from './pages/VendorsPage';
  import InventoryPage from './pages/InventoryPage';
  import ProcurementPage from './pages/ProcurementPage'; // <-- IMPORT THE NEW PAGE

  function App() {
    const [view, setView] = useState('inventory');

    return (
      <Layout setView={setView} currentView={view}>
        {view === 'vendors' && <VendorsPage />}
        {view === 'inventory' && <InventoryPage />}
        {view === 'procurement' && <ProcurementPage />} {/* <-- RENDER THE NEW PAGE */}
      </Layout>
    );
  }

  export default App;