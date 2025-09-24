import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import VendorList from '../components/VendorList';
import AddVendorForm from '../components/AddVendorForm';

// We can keep the styles and modal root element setup here
const customModalStyles = {
  content: {
    top: '50%', left: '50%', right: 'auto', bottom: 'auto',
    marginRight: '-50%', transform: 'translate(-50%, -50%)', width: '400px',
  },
};
Modal.setAppElement('#root');

function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/vendors');
        setVendors(response.data);
      } catch (err) {
        setError('Failed to fetch vendors.');
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();
  }, []);

  const handleVendorAdded = (newVendor) => {
    setVendors([newVendor, ...vendors]);
    closeModal();
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Vendors Management</h2>
        <button onClick={openModal} style={{ padding: '10px 20px' }}>+ New Vendor</button>
      </div>
      <Modal isOpen={isModalOpen} onRequestClose={closeModal} style={customModalStyles}>
        <AddVendorForm onVendorAdded={handleVendorAdded} onCancel={closeModal} />
      </Modal>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && <VendorList vendors={vendors} />}
    </div>
  );
}

export default VendorsPage;