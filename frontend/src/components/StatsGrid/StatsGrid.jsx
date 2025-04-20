// StatsGrid.js
import React from "react";
import { motion } from "framer-motion";
import "./StatsGrid.css";

const StatsGrid = ({ stats }) => {
  // Ensure stats is defined and has the expected properties
  if (!stats) {
    return <div className="stats-grid">Loading statistics...</div>;
  }

  const statCards = [
    {
      title: "Active Loans",
      value: stats.activeLoans || 0,
      icon: "📊",
      color: "blue",
    },
    {
      title: "Completed Loans",
      value: stats.completedLoans || 0,
      icon: "✅",
      color: "green",
    },
    {
      title: "Total Borrowed",
      value: `M${stats.totalLoanAmount?.toLocaleString() || 0}`,
      icon: "💰",
      color: "purple",
    },
    {
      title: "MFI Memberships",
      value: stats.mfiMemberships || 0,
      icon: "🏦",
      color: "orange",
    },
  ];

  return (
    <div className="stats-grid">
      {statCards.map((stat, index) => (
        <motion.div
          key={index}
          className={`stat-card ${stat.color}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="stat-icon">{stat.icon}</div>
          <div className="stat-content">
            <h3>{stat.title}</h3>
            <p>{stat.value}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsGrid;
