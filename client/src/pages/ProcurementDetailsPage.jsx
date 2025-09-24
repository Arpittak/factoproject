import React, { useState, useEffect } from "react";
import axios from "axios";
import "./InventoryPage.css"; // Reusing inventory page styles
// import AddStoneForm from '../components/AddStoneForm';

function ProcurementDetailsPage({ procurementId, onBack }) {
  const [procurement, setProcurement] = useState(null);
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [deleteModal, setDeleteModal] = useState({ show: false, item: null });
  const [addStoneModal, setAddStoneModal] = useState(false);

  useEffect(() => {
    if (procurementId) {
      fetchProcurementDetails();
    }
  }, [procurementId]);

  const fetchProcurementDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/procurements/${procurementId}`);
      setProcurement(response.data.procurement);
      setItems(response.data.items);
      setSummary(response.data.summary);
    } catch (err) {
      setError("Failed to fetch procurement details");
      console.error("Error fetching procurement details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    onBack();
  };

  if (loading) {
    return (
      <div style={{ padding: "20px" }}>
        <p>Loading procurement details...</p>
      </div>
    );
  }

  if (error || !procurement) {
    return (
      <div style={{ padding: "20px" }}>
        <p>{error || "Procurement not found"}</p>
        <button onClick={handleBack} className="btn-secondary">
          Back to Procurement
        </button>
      </div>
    );
  }

  const handleDeleteItem = async (itemId) => {
    try {
      await axios.delete(`/api/procurements/items/${itemId}`);
      fetchProcurementDetails(); // Refresh data
      setDeleteModal({ show: false, item: null });
    } catch (error) {
      alert("Failed to delete procurement item");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={handleBack}
              style={{
                background: "white",
                border: "1px solid #e9ecef",
                borderRadius: "4px",
                padding: "8px 12px",
                cursor: "pointer",
                color: "black",
              }}
            >
              ← Back
            </button>
            <div>
              <h2>Procurement Details</h2>
              <p>Invoice: {procurement.supplier_invoice}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div
        style={{
          background: "white",
          borderRadius: "8px",
          marginBottom: "20px",
          border: "1px solid #e9ecef",
        }}
      >
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid #e9ecef",
            padding: "0",
          }}
        >
          <button
            onClick={() => setActiveTab("overview")}
            style={{
              padding: "16px 24px",
              border: "none",
              background: activeTab === "overview" ? "#f8f9fa" : "white",
              color: "black",
              borderBottom:
                activeTab === "overview"
                  ? "2px solid black"
                  : "2px solid transparent",
              cursor: "pointer",
              fontWeight: activeTab === "overview" ? "600" : "500",
            }}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("items")}
            style={{
              padding: "16px 24px",
              border: "none",
              background: activeTab === "items" ? "#f8f9fa" : "white",
              color: "black",
              borderBottom:
                activeTab === "items"
                  ? "2px solid black"
                  : "2px solid transparent",
              cursor: "pointer",
              fontWeight: activeTab === "items" ? "600" : "500",
            }}
          >
            Items
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ padding: "24px" }}>
          {activeTab === "overview" && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "24px" }}
            >
              {/* Top Row - Quick Information and Vendor Information */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
                  gap: "24px",
                }}
              >
                {/* Quick Information Section */}
                <div
                  style={{
                    background: "white",
                    border: "1px solid #e9ecef",
                    borderRadius: "8px",
                    padding: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "16px",
                      paddingBottom: "12px",
                      borderBottom: "1px solid #e9ecef",
                    }}
                  >
                    <span style={{ fontSize: "16px" }}>📄</span>
                    <h3 style={{ margin: 0, color: "black" }}>
                      Quick Information
                    </h3>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(150px, 1fr))",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          fontSize: "12px",
                          color: "black",
                          opacity: "0.7",
                          display: "block",
                          marginBottom: "4px",
                        }}
                      >
                        Entry Date
                      </label>
                      <div style={{ fontWeight: "500", color: "black" }}>
                        {new Date(procurement.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <label
                        style={{
                          fontSize: "12px",
                          color: "black",
                          opacity: "0.7",
                          display: "block",
                          marginBottom: "4px",
                        }}
                      >
                        Invoice Date
                      </label>
                      <div style={{ fontWeight: "500", color: "black" }}>
                        {procurement.invoice_date
                          ? new Date(
                              procurement.invoice_date
                            ).toLocaleDateString()
                          : "N/A"}
                      </div>
                    </div>
                    <div>
                      <label
                        style={{
                          fontSize: "12px",
                          color: "black",
                          opacity: "0.7",
                          display: "block",
                          marginBottom: "4px",
                        }}
                      >
                        Supplier Invoice
                      </label>
                      <div style={{ fontWeight: "500", color: "black" }}>
                        {procurement.supplier_invoice}
                      </div>
                    </div>
                    <div>
                      <label
                        style={{
                          fontSize: "12px",
                          color: "black",
                          opacity: "0.7",
                          display: "block",
                          marginBottom: "4px",
                        }}
                      >
                        Vehicle Number
                      </label>
                      <div style={{ fontWeight: "500", color: "black" }}>
                        {procurement.vehicle_number || "N/A"}
                      </div>
                    </div>
                    <div>
                      <label
                        style={{
                          fontSize: "12px",
                          color: "black",
                          opacity: "0.7",
                          display: "block",
                          marginBottom: "4px",
                        }}
                      >
                        Entry By
                      </label>
                      <div style={{ fontWeight: "500", color: "black" }}>
                        Admin
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vendor Information Section */}
                <div
                  style={{
                    background: "white",
                    border: "1px solid #e9ecef",
                    borderRadius: "8px",
                    padding: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "16px",
                      paddingBottom: "12px",
                      borderBottom: "1px solid #e9ecef",
                    }}
                  >
                    <span style={{ fontSize: "16px" }}>🏢</span>
                    <h3 style={{ margin: 0, color: "black" }}>
                      Vendor Information
                    </h3>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(150px, 1fr))",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          fontSize: "12px",
                          color: "black",
                          opacity: "0.7",
                          display: "block",
                          marginBottom: "4px",
                        }}
                      >
                        Company Name
                      </label>
                      <div style={{ fontWeight: "500", color: "black" }}>
                        {procurement.company_name}
                      </div>
                    </div>
                    <div>
                      <label
                        style={{
                          fontSize: "12px",
                          color: "black",
                          opacity: "0.7",
                          display: "block",
                          marginBottom: "4px",
                        }}
                      >
                        Contact Person
                      </label>
                      <div style={{ fontWeight: "500", color: "black" }}>
                        {procurement.contact_person || "N/A"}
                      </div>
                    </div>
                    <div>
                      <label
                        style={{
                          fontSize: "12px",
                          color: "black",
                          opacity: "0.7",
                          display: "block",
                          marginBottom: "4px",
                        }}
                      >
                        Phone
                      </label>
                      <div style={{ fontWeight: "500", color: "black" }}>
                        {procurement.phone_number || "N/A"}
                      </div>
                    </div>
                    <div>
                      <label
                        style={{
                          fontSize: "12px",
                          color: "black",
                          opacity: "0.7",
                          display: "block",
                          marginBottom: "4px",
                        }}
                      >
                        Email
                      </label>
                      <div style={{ fontWeight: "500", color: "black" }}>
                        {procurement.email_address || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* GST Details Section */}
              <div
                style={{
                  background: "white",
                  border: "1px solid #e9ecef",
                  borderRadius: "8px",
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "16px",
                    paddingBottom: "12px",
                    borderBottom: "1px solid #e9ecef",
                  }}
                >
                  <span style={{ fontSize: "16px" }}>💰</span>
                  <h3 style={{ margin: 0, color: "black" }}>
                    GST Details & Summary
                  </h3>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "16px",
                    marginBottom: "24px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        fontSize: "12px",
                        color: "black",
                        opacity: "0.7",
                        display: "block",
                        marginBottom: "4px",
                      }}
                    >
                      Type of GST
                    </label>
                    <div style={{ fontWeight: "500", color: "black" }}>
                      {procurement.gst_type}
                    </div>
                  </div>
                  <div>
                    <label
                      style={{
                        fontSize: "12px",
                        color: "black",
                        opacity: "0.7",
                        display: "block",
                        marginBottom: "4px",
                      }}
                    >
                      Tax Percentage
                    </label>
                    <div style={{ fontWeight: "500", color: "black" }}>
                      {procurement.tax_percentage
                        ? `${procurement.tax_percentage}%`
                        : "N/A"}
                    </div>
                  </div>
                  <div>
                    <label
                      style={{
                        fontSize: "12px",
                        color: "black",
                        opacity: "0.7",
                        display: "block",
                        marginBottom: "4px",
                      }}
                    >
                      Additional Amount
                    </label>
                    <div style={{ fontWeight: "500", color: "black" }}>
                      {procurement.additional_taxable_amount
                        ? `₹${parseFloat(
                            procurement.additional_taxable_amount
                          ).toLocaleString("en-IN")}`
                        : "N/A"}
                    </div>
                  </div>
                  <div>
                    <label
                      style={{
                        fontSize: "12px",
                        color: "black",
                        opacity: "0.7",
                        display: "block",
                        marginBottom: "4px",
                      }}
                    >
                      Freight Charges
                    </label>
                    <div style={{ fontWeight: "500", color: "black" }}>
                      {procurement.freight_charges
                        ? `₹${parseFloat(
                            procurement.freight_charges
                          ).toLocaleString("en-IN")}`
                        : "N/A"}
                    </div>
                  </div>
                  <div>
                    <label
                      style={{
                        fontSize: "12px",
                        color: "black",
                        opacity: "0.7",
                        display: "block",
                        marginBottom: "4px",
                      }}
                    >
                      Items Count
                    </label>
                    <div style={{ fontWeight: "500", color: "black" }}>
                      {summary?.totalItems || 0} items
                    </div>
                  </div>
                </div>

                {/* Procurement Summary */}
                <div
                  style={{ borderTop: "1px solid #e9ecef", paddingTop: "20px" }}
                >
                  <h4
                    style={{
                      color: "black",
                      margin: "0 0 16px 0",
                      textAlign: "center",
                    }}
                  >
                    Procurement Summary
                  </h4>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(280px, 1fr))",
                      gap: "16px",
                    }}
                  >
                    <div
                      style={{
                        background: "#f8f9fa",
                        border: "1px solid #e9ecef",
                        borderRadius: "6px",
                        padding: "16px",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "28px",
                          fontWeight: "600",
                          color: "#007bff",
                          marginBottom: "6px",
                        }}
                      >
                        ₹
                        {summary?.totalProcurementAmount?.toLocaleString(
                          "en-IN"
                        ) || "0"}
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "black",
                          fontWeight: "500",
                          marginBottom: "2px",
                        }}
                      >
                        Total Procurement Amount
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "black",
                          opacity: "0.6",
                        }}
                      >
                        Including additional amount
                      </div>
                    </div>

                    <div
                      style={{
                        background: "#f8f9fa",
                        border: "1px solid #e9ecef",
                        borderRadius: "6px",
                        padding: "16px",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "28px",
                          fontWeight: "600",
                          color: "#fd7e14",
                          marginBottom: "6px",
                        }}
                      >
                        ₹{summary?.taxAmount?.toLocaleString("en-IN") || "0"}
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "black",
                          fontWeight: "500",
                          marginBottom: "2px",
                        }}
                      >
                        Total Tax Amount
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "black",
                          opacity: "0.6",
                        }}
                      >
                        {procurement.tax_percentage
                          ? "Tax applied"
                          : "No tax applied"}
                      </div>
                    </div>

                    <div
                      style={{
                        background: "#f8f9fa",
                        border: "1px solid #e9ecef",
                        borderRadius: "6px",
                        padding: "16px",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "28px",
                          fontWeight: "600",
                          color: "#28a745",
                          marginBottom: "6px",
                        }}
                      >
                        ₹
                        {parseFloat(procurement.grand_total).toLocaleString(
                          "en-IN"
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "black",
                          fontWeight: "500",
                          marginBottom: "2px",
                        }}
                      >
                        Grand Total (Tax + Freight)
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "black",
                          opacity: "0.6",
                        }}
                      >
                        Including tax and freight charges
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "items" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <h3 style={{ color: "black", margin: 0 }}>Procurement Items</h3>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <button
                    onClick={() => setAddStoneModal(true)}
                    className="btn-primary"
                    style={{ fontSize: "14px", padding: "8px 16px" }}
                  >
                    + Add Stone
                  </button>
                  <div style={{ color: "black", opacity: "0.7" }}>
                    Total: {items.length} items
                  </div>
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="desktop-view">
                <div className="table-responsive">
                  <table className="inventory-table">
                    <thead>
                      <tr>
                        <th>Stone Details</th>
                        <th>Dimensions (mm)</th>
                        <th>Specifications</th>
                        <th>Quantity</th>
                        <th>Rate</th>
                        <th>Amount</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id} className="table-row">
                          <td className="stone-details">
                            <div className="stone-name-display">
                              {item.stone_name}
                            </div>
                            <div className="stone-type">{item.stone_type}</div>
                            {item.hsn_code && (
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "black",
                                  opacity: "0.6",
                                }}
                              >
                                HSN: {item.hsn_code}
                              </div>
                            )}
                          </td>
                          <td className="dimensions">
                            {`${item.length_mm} × ${item.width_mm}`}
                            {item.thickness_mm && ` × ${item.thickness_mm}`}
                          </td>
                          <td>
                            <div style={{ fontSize: "13px" }}>
                              <div>Stage: {item.stage_name || "N/A"}</div>
                              <div>Edges: {item.edges_type_name || "N/A"}</div>
                              <div>
                                Finish: {item.finishing_type_name || "N/A"}
                              </div>
                              <div>
                                Calibrated: {item.is_calibrated ? "Yes" : "No"}
                              </div>
                            </div>
                          </td>
                          <td className="quantity">
                            <div className="quantity-primary">
                              {item.quantity} {item.units}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: "500" }}>
                              ₹{parseFloat(item.rate).toLocaleString("en-IN")}
                            </div>
                            <div style={{ fontSize: "12px", opacity: "0.7" }}>
                              per {item.rate_unit}
                            </div>
                          </td>
                          <td>
                            <div className="quantity-primary">
                              ₹
                              {parseFloat(item.item_amount).toLocaleString(
                                "en-IN"
                              )}
                            </div>
                          </td>
                          <td>
                            <button
                              className="action-btn delete-btn"
                              onClick={() =>
                                setDeleteModal({ show: true, item })
                              }
                              title="Delete Item"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="mobile-view">
                {items.map((item) => (
                  <div key={item.id} className="inventory-card">
                    <div className="card-header">
                      <div className="stone-info">
                        <div className="stone-name-display">
                          {item.stone_name}
                        </div>
                        <span className="stone-type">{item.stone_type}</span>
                      </div>
                      <div className="stage-badge">
                        ₹{parseFloat(item.item_amount).toLocaleString("en-IN")}
                      </div>
                    </div>

                    <div className="card-details">
                      <div className="detail-row">
                        <span className="detail-label">Dimensions:</span>
                        <span className="detail-value">
                          {`${item.length_mm} × ${item.width_mm}`}
                          {item.thickness_mm && ` × ${item.thickness_mm}`} mm
                        </span>
                      </div>

                      <div className="detail-row">
                        <span className="detail-label">Quantity:</span>
                        <span className="detail-value">
                          {item.quantity} {item.units}
                        </span>
                      </div>

                      <div className="detail-row">
                        <span className="detail-label">Rate:</span>
                        <span className="detail-value">
                          ₹{parseFloat(item.rate).toLocaleString("en-IN")} per{" "}
                          {item.rate_unit}
                        </span>
                      </div>

                      <div className="detail-row">
                        <span className="detail-label">Stage:</span>
                        <span className="detail-value">
                          {item.stage_name || "N/A"}
                        </span>
                      </div>

                      <div className="detail-row">
                        <span className="detail-label">Edges:</span>
                        <span className="detail-value">
                          {item.edges_type_name || "N/A"}
                        </span>
                      </div>

                      <div className="detail-row">
                        <span className="detail-label">Finishing:</span>
                        <span className="detail-value">
                          {item.finishing_type_name || "N/A"}
                        </span>
                      </div>

                      <div className="detail-row">
                        <span className="detail-label">Calibrated:</span>
                        <span className="detail-value">
                          {item.is_calibrated ? "Yes" : "No"}
                        </span>
                      </div>

                      {item.hsn_code && (
                        <div className="detail-row">
                          <span className="detail-label">HSN Code:</span>
                          <span className="detail-value">{item.hsn_code}</span>
                        </div>
                      )}

                      {item.comments && (
                        <div className="detail-row">
                          <span className="detail-label">Comments:</span>
                          <span className="detail-value">{item.comments}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Items Summary */}
              <div
                style={{
                  marginTop: "24px",
                  padding: "16px",
                  background: "#f8f9fa",
                  borderRadius: "8px",
                  border: "1px solid #e9ecef",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: "16px",
                    textAlign: "center",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: "600",
                        color: "black",
                      }}
                    >
                      {items.length}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "black",
                        opacity: "0.7",
                      }}
                    >
                      Total Items
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: "600",
                        color: "black",
                      }}
                    >
                      {items
                        .reduce(
                          (sum, item) => sum + parseFloat(item.quantity),
                          0
                        )
                        .toFixed(2)}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "black",
                        opacity: "0.7",
                      }}
                    >
                      Total Quantity
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: "600",
                        color: "black",
                      }}
                    >
                      ₹
                      {items
                        .reduce(
                          (sum, item) => sum + parseFloat(item.item_amount),
                          0
                        )
                        .toLocaleString("en-IN")}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "black",
                        opacity: "0.7",
                      }}
                    >
                      Total Amount
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {addStoneModal && (
        <div className="modal-overlay" onClick={() => setAddStoneModal(false)}>
          <div
            className="modal-content"
            style={{ width: "600px", maxHeight: "90vh", overflow: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <AddStoneForm
              procurementId={procurementId}
              onStoneAdded={() => {
                setAddStoneModal(false);
                fetchProcurementDetails();
              }}
              onCancel={() => setAddStoneModal(false)}
            />
          </div>
        </div>
      )}
      {deleteModal.show && (
        <div
          className="modal-overlay"
          onClick={() => setDeleteModal({ show: false, item: null })}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Stone Item</h3>
            <p>
              Are you sure you want to delete this stone item? This action will
              permanently remove the stone from this procurement and reduce the
              quantity from inventory accordingly. This cannot be undone.
            </p>
            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setDeleteModal({ show: false, item: null })}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteItem(deleteModal.item.id)}
                className="btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProcurementDetailsPage;
