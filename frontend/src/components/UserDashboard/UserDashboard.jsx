import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Sidebar from "../SideBar/SideBar";
import Header from "../Header/Header";
import StatsGrid from "../StatsGrid/StatsGrid";
import LoanTable from "../LoanTable/LoanTable";
import LoanApplicationForm from "../LoanApplicationForm/LoanApplicationForm";
import "./UserDashboard.css";
import UserProfile from "../UserProfile/UserProfile";

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState(6);
  const [loanAmount, setLoanAmount] = useState(5000);
  const [mfis, setMfis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joinStatus, setJoinStatus] = useState({});
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [selectedMfi, setSelectedMfi] = useState(null);
  const [borrowerData, setBorrowerData] = useState({
    national_id: "",
    full_name: "",
    date_of_birth: "",
    address: "",
    contact_number: "",
    email: "",
    employment_status: "employed",
    monthly_income: "",
  });

  // Safely initialize userData with default mfiMemberships
  const [userData, setUserData] = useState(() => {
    try {
      const storedUser = sessionStorage.getItem("user");
      return storedUser
        ? {
            ...JSON.parse(storedUser),
            mfiMemberships: JSON.parse(storedUser)?.mfiMemberships || [],
          }
        : {
            name: "",
            mfi: "",
            loans: [],
            mfiMemberships: [],
          };
    } catch (err) {
      console.error("Error parsing user data:", err);
      return {
        name: "",
        mfi: "",
        loans: [],
        mfiMemberships: [],
      };
    }
  });

  const interestRates = { 6: 12.5, 12: 14.0, 18: 15.5, 24: 17.0 };

  useEffect(() => {
    const fetchMfis = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/mfi/");
        if (!response.ok) {
          throw new Error("Failed to fetch MFIs");
        }
        const data = await response.json();
        setMfis(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserLoans = async () => {
      try {
        const token =
          sessionStorage.getItem("authToken") ||
          localStorage.getItem("authToken");
        const response = await fetch("http://127.0.0.1:8000/api/loans/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user loans");
        }

        const loans = await response.json();
        setUserData((prev) => ({
          ...prev,
          loans: loans.map((loan) => ({
            id: loan.id,
            amount: loan.amount,
            status: loan.status,
            nextPayment: loan.next_payment_date,
            progress: loan.payment_progress,
          })),
          // Ensure mfiMemberships exists
          mfiMemberships: prev.mfiMemberships || [],
        }));
      } catch (err) {
        console.error("Error fetching loans:", err);
      }
    };

    if (activeTab === "mfi") {
      fetchMfis();
    }

    fetchUserLoans();
  }, [activeTab]);

  const calculateMonthlyPayment = () => {
    const principal = loanAmount;
    const rate = interestRates[selectedTerm] / 100 / 12;
    return (principal * rate) / (1 - Math.pow(1 + rate, -selectedTerm));
  };

  const handleJoinClick = (mfi) => {
    setSelectedMfi(mfi);
    setBorrowerData({
      ...borrowerData,
      full_name: userData?.full_name || userData?.name || "",
    });
    setShowJoinForm(true);
  };

  const handleBorrowerInputChange = (e) => {
    const { name, value } = e.target;
    setBorrowerData({
      ...borrowerData,
      [name]: value,
    });
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    try {
      setJoinStatus((prev) => ({ ...prev, [selectedMfi.id]: "joining" }));

      const token =
        sessionStorage.getItem("authToken") ||
        localStorage.getItem("authToken");

      const response = await fetch("http://127.0.0.1:8000/api/borrowers/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...borrowerData,
          mfi: selectedMfi.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to join MFI");
      }

      setJoinStatus((prev) => ({ ...prev, [selectedMfi.id]: "success" }));
      setShowJoinForm(false);

      // Safely update memberships
      setUserData((prev) => ({
        ...prev,
        mfiMemberships: [
          ...(prev.mfiMemberships || []),
          {
            name: selectedMfi.name,
            joined: new Date().toISOString().split("T")[0],
            active: true,
          },
        ],
      }));
    } catch (err) {
      setJoinStatus((prev) => ({ ...prev, [selectedMfi.id]: "error" }));
      console.error("Error joining MFI:", err);
    }
  };

  const renderMfiStatus = (isActive) => {
    return (
      <span className={`status-badge ${isActive ? "active" : "inactive"}`}>
        {isActive ? "Active" : "Inactive"}
      </span>
    );
  };

  const renderJoinButton = (mfi) => {
    // Safely handle missing mfiMemberships
    const memberships = userData?.mfiMemberships || [];
    const isMember = memberships.some((m) => m?.name === mfi.name);
    const status = joinStatus[mfi.id];

    if (isMember) {
      return (
        <button className="btn btn-disabled" disabled>
          Already a Member
        </button>
      );
    }

    switch (status) {
      case "joining":
        return (
          <button className="btn btn-secondary" disabled>
            Joining...
          </button>
        );
      case "success":
        return (
          <button className="btn btn-success" disabled>
            Joined Successfully
          </button>
        );
      case "error":
        return (
          <button
            className="btn btn-error"
            onClick={() => handleJoinClick(mfi)}
          >
            Retry Join
          </button>
        );
      default:
        return (
          <button
            className="btn btn-secondary"
            onClick={() => handleJoinClick(mfi)}
          >
            Join MFI
          </button>
        );
    }
  };

  return (
    <div
      className={`dashboard-container ${
        sidebarCollapsed ? "collapsed-sidebar" : ""
      }`}
    >
      <Sidebar
        activeTab={activeTab}
        sidebarCollapsed={sidebarCollapsed}
        setActiveTab={setActiveTab}
        setSidebarCollapsed={setSidebarCollapsed}
      />
      <main className="dashboard-main">
        <Header
          userData={userData}
          showUserMenu={showUserMenu}
          setShowUserMenu={setShowUserMenu}
        />
        <div className="dashboard-content">
          {activeTab === "overview" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2>Overview Content</h2>
              <StatsGrid
                loans={userData?.loans || []}
                mfiMemberships={userData?.mfiMemberships || []}
              />
            </motion.div>
          )}
          {activeTab === "loans" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <LoanTable loans={userData?.loans || []} />
            </motion.div>
          )}
          {activeTab === "apply" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <LoanApplicationForm
                userData={userData || {}}
                loanAmount={loanAmount}
                setLoanAmount={setLoanAmount}
                selectedTerm={selectedTerm}
                setSelectedTerm={setSelectedTerm}
                calculateMonthlyPayment={calculateMonthlyPayment}
                interestRates={interestRates}
              />
            </motion.div>
          )}

          {activeTab === "profile" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <UserProfile userData={userData} />
            </motion.div>
          )}

          {activeTab === "mfi" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="mfi-management">
                <h2>Available Microfinance Institutions</h2>
                {loading ? (
                  <div className="loading-spinner">Loading MFIs...</div>
                ) : error ? (
                  <div className="error-message">{error}</div>
                ) : (
                  <>
                    <div className="mfi-grid">
                      {mfis.map((mfi) => (
                        <div key={mfi.id} className="mfi-card">
                          <div className="mfi-card-header">
                            <h3>{mfi.name}</h3>
                            {renderMfiStatus(mfi.is_active)}
                          </div>
                          <div className="mfi-card-body">
                            <div className="mfi-detail">
                              <span className="detail-label">Location:</span>
                              <span>{mfi.location}</span>
                            </div>
                            <div className="mfi-detail">
                              <span className="detail-label">Contact:</span>
                              <a href={`mailto:${mfi.contact_info}`}>
                                {mfi.contact_info}
                              </a>
                            </div>
                          </div>
                          <div className="mfi-card-footer">
                            <button className="btn btn-primary">
                              View Details
                            </button>
                            {renderJoinButton(mfi)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {showJoinForm && selectedMfi && (
                      <div className="join-form-overlay">
                        <div className="join-form-container">
                          <h3>Join {selectedMfi.name}</h3>
                          <p>Please enter your information to join this MFI</p>
                          <form onSubmit={handleJoinSubmit}>
                            <div className="form-group">
                              <label>National ID</label>
                              <input
                                type="text"
                                name="national_id"
                                value={borrowerData.national_id}
                                onChange={handleBorrowerInputChange}
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label>Full Name</label>
                              <input
                                type="text"
                                name="full_name"
                                value={borrowerData.full_name}
                                onChange={handleBorrowerInputChange}
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label>Date of Birth</label>
                              <input
                                type="date"
                                name="date_of_birth"
                                value={borrowerData.date_of_birth}
                                onChange={handleBorrowerInputChange}
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label>Address</label>
                              <input
                                type="text"
                                name="address"
                                value={borrowerData.address}
                                onChange={handleBorrowerInputChange}
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label>Contact Number</label>
                              <input
                                type="tel"
                                name="contact_number"
                                value={borrowerData.contact_number}
                                onChange={handleBorrowerInputChange}
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label>Email</label>
                              <input
                                type="email"
                                name="email"
                                value={borrowerData.email}
                                onChange={handleBorrowerInputChange}
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label>Employment Status</label>
                              <select
                                name="employment_status"
                                value={borrowerData.employment_status}
                                onChange={handleBorrowerInputChange}
                                required
                              >
                                <option value="employed">Employed</option>
                                <option value="self_employed">
                                  Self Employed
                                </option>
                                <option value="unemployed">Unemployed</option>
                              </select>
                            </div>
                            <div className="form-group">
                              <label>Monthly Income</label>
                              <input
                                type="number"
                                name="monthly_income"
                                value={borrowerData.monthly_income}
                                onChange={handleBorrowerInputChange}
                                required
                              />
                            </div>
                            <div className="form-actions">
                              <button
                                type="button"
                                className="btn btn-cancel"
                                onClick={() => setShowJoinForm(false)}
                              >
                                Cancel
                              </button>
                              <button type="submit" className="btn btn-submit">
                                Submit Application
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
