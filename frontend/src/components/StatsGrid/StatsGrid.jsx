// StatsGrid.jsx
import React from "react";
import { Wallet, Clock, Building } from "lucide-react";
import "./StatsGrid.css";

const StatsGrid = ({ loans, mfiMemberships }) => {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon">
          <Wallet size={24} />
        </div>
        <div className="stat-content">
          <h3>Active Loans</h3>
          <p className="stat-value">
            {loans.filter((loan) => loan.status === "Active").length}
          </p>
          <p className="stat-desc">Manage your current loans</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">
          <Clock size={24} />
        </div>
        <div className="stat-content">
          <h3>Next Payment</h3>
          <p className="stat-value">
            M
            {loans
              .find((loan) => loan.status === "Active")
              ?.nextPayment?.split("-")[2] || "-"}
          </p>
          <p className="stat-desc">Upcoming payment date</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">
          <Building size={24} />
        </div>
        <div className="stat-content">
          <h3>Active MFIs</h3>
          <p className="stat-value">
            {mfiMemberships.filter((mfi) => mfi.active).length}
          </p>
          <p className="stat-desc">Financial partners</p>
        </div>
      </div>
    </div>
  );
};

export default StatsGrid;
