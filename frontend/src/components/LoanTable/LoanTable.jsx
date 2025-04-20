// LoanTable.jsx
import React from "react";
import "./LoanTable.css";

const LoanTable = ({ loans }) => {
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Loan ID</th>
          <th>Amount</th>
          <th>Status</th>
          <th>Next Payment</th>
          <th>Progress</th>
        </tr>
      </thead>
      <tbody>
        {loans.map((loan, index) => (
          <tr key={index}>
            <td>{loan.id}</td>
            <td>M{loan.amount.toLocaleString()}</td>
            <td>
              <span
                className={`status-badge ${
                  loan.status === "Active"
                    ? "status-active"
                    : "status-completed"
                }`}
              >
                {loan.status}
              </span>
            </td>
            <td>{loan.nextPayment || "N/A"}</td>
            <td>
              <div
                className="score-bar"
                style={{
                  width: `${loan.progress}%`,
                  backgroundColor: loan.progress > 90 ? "#4CAF50" : "#667eea",
                }}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default LoanTable;
