import React, { useState, useEffect } from "react";
import axios from "axios";

import {
  Search,
  Filter,
  Download,
  User,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import "./BorrowerManagement.css";

const BorrowerManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedBorrower, setSelectedBorrower] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [borrowers, setBorrowers] = useState([]);
  useEffect(() => {
    const fetchBorrowers = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/borrowers/"
        );
        const mappedData = response.data.map((b) => ({
          id: `B${String(b.id).padStart(3, "0")}`,
          name: b.full_name,
          phone: b.contact_number,
          location: b.address,
          activeLoans: Math.floor(Math.random() * 3), // Replace with real data if available
          totalBorrowed: parseFloat(b.monthly_income), // Replace if real borrowed amount exists
          status: "Active", // You can set this based on your backend, or remove the filter
        }));
        setBorrowers(mappedData);
      } catch (error) {
        console.error("Error fetching borrowers:", error);
      }
    };

    fetchBorrowers();
  }, []);

  const filteredBorrowers = borrowers.filter((borrower) => {
    const matchesSearch =
      borrower.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      borrower.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || borrower.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="borrower-management">
      {/* Header Section */}
      <header className="bm-header">
        <div className="header-text">
          <h1>Borrower Management</h1>
          <p>Manage and track borrower information</p>
        </div>
        <button className="primary-btn">
          <Plus size={18} />
          Add New Borrower
        </button>
      </header>

      {/* Controls Section */}
      <section className="bm-controls">
        <div className="search-container">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search borrowers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-container">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </section>

      {/* Main Table */}
      <div className="bm-table-container">
        <table className="bm-data-table">
          <thead>
            <tr>
              <th>Borrower ID</th>
              <th>Name</th>
              <th>Contact</th>
              <th>Location</th>
              <th>Active Loans</th>
              <th>Total Borrowed</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredBorrowers.map((borrower) => (
              <tr key={borrower.id}>
                <td>{borrower.id}</td>
                <td>{borrower.name}</td>
                <td>{borrower.phone}</td>
                <td>{borrower.location}</td>
                <td>{borrower.activeLoans}</td>
                <td>M{borrower.totalBorrowed.toLocaleString()}</td>
                <td>
                  <span
                    className={`status-tag ${borrower.status.toLowerCase()}`}
                  >
                    {borrower.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="icon-btn"
                      onClick={() => {
                        setSelectedBorrower(borrower);
                        setShowModal(true);
                      }}
                    >
                      <User size={16} />
                    </button>
                    <button className="icon-btn">
                      <Edit size={16} />
                    </button>
                    <button className="icon-btn danger">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {showModal && (
        <div className="bm-modal-overlay">
          <div className="bm-modal">
            <div className="modal-header">
              <h3>Borrower Details</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                &times;
              </button>
            </div>

            <div className="modal-content">
              {selectedBorrower && (
                <>
                  <div className="detail-row">
                    <span>Borrower ID:</span>
                    <p>{selectedBorrower.id}</p>
                  </div>
                  <div className="detail-row">
                    <span>Full Name:</span>
                    <p>{selectedBorrower.name}</p>
                  </div>
                  <div className="detail-row">
                    <span>Contact Number:</span>
                    <p>{selectedBorrower.phone}</p>
                  </div>
                  <div className="detail-row">
                    <span>Location:</span>
                    <p>{selectedBorrower.location}</p>
                  </div>
                  <div className="detail-row">
                    <span>Account Status:</span>
                    <p
                      className={`status-tag ${selectedBorrower.status.toLowerCase()}`}
                    >
                      {selectedBorrower.status}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BorrowerManagement;
