import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  BarChart2,
  Users,
  DollarSign,
  Clock,
  AlertTriangle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  PieChart,
  TrendingUp,
  User,
  LogOut,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [period, setPeriod] = useState("monthly");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loansData, setLoansData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Mock data for dashboard
  const dashboardData = {
    stats: {
      activeLoans: 324,
      disbursedAmount: 432500,
      pendingApplications: 42,
      defaultRate: 5.2,
      averageLoanAmount: 1380,
      totalBorrowers: 512,
    },
    recentLoans: [
      {
        id: "L78901",
        borrower: "Lineo Mokete",
        amount: 2500,
        status: "Active",
        date: "2025-03-15",
        daysOverdue: 0,
      },
      {
        id: "L78856",
        borrower: "Thabo Molapo",
        amount: 1200,
        status: "Active",
        date: "2025-03-10",
        daysOverdue: 2,
      },
      {
        id: "L78821",
        borrower: "Palesa Nthunya",
        amount: 5000,
        status: "Overdue",
        date: "2025-02-28",
        daysOverdue: 7,
      },
      {
        id: "L78798",
        borrower: "Motlatsi Khabo",
        amount: 800,
        status: "Completed",
        date: "2025-02-20",
        daysOverdue: 0,
      },
      {
        id: "L78765",
        borrower: "Nthabiseng Mohapi",
        amount: 3000,
        status: "Active",
        date: "2025-02-15",
        daysOverdue: 0,
      },
    ],
    loanApplications: [
      {
        id: "A12345",
        borrower: "Rethabile Mothibi",
        amount: 1800,
        status: "Pending",
        date: "2025-03-20",
        creditScore: 72,
      },
      {
        id: "A12346",
        borrower: "Lebohang Sello",
        amount: 3500,
        status: "Under Review",
        date: "2025-03-19",
        creditScore: 68,
      },
      {
        id: "A12347",
        borrower: "Tumelo Motsoeneng",
        amount: 1200,
        status: "Approved",
        date: "2025-03-18",
        creditScore: 81,
      },
      {
        id: "A12348",
        borrower: "Mpho Letsie",
        amount: 5000,
        status: "Rejected",
        date: "2025-03-17",
        creditScore: 45,
      },
      {
        id: "A12349",
        borrower: "Katleho Ramokoena",
        amount: 2500,
        status: "Pending",
        date: "2025-03-16",
        creditScore: 75,
      },
    ],
    loanPerformance: {
      monthly: [
        { month: "Oct", disbursed: 85000, repaid: 76000, defaulted: 9000 },
        { month: "Nov", disbursed: 92000, repaid: 85000, defaulted: 7000 },
        { month: "Dec", disbursed: 105000, repaid: 91000, defaulted: 14000 },
        { month: "Jan", disbursed: 88000, repaid: 83000, defaulted: 5000 },
        { month: "Feb", disbursed: 97000, repaid: 90000, defaulted: 7000 },
        { month: "Mar", disbursed: 110000, repaid: 102000, defaulted: 8000 },
      ],
      quarterly: [
        {
          quarter: "Q1 2024",
          disbursed: 280000,
          repaid: 260000,
          defaulted: 20000,
        },
        {
          quarter: "Q2 2024",
          disbursed: 310000,
          repaid: 290000,
          defaulted: 20000,
        },
        {
          quarter: "Q3 2024",
          disbursed: 295000,
          repaid: 270000,
          defaulted: 25000,
        },
        {
          quarter: "Q4 2024",
          disbursed: 330000,
          repaid: 308000,
          defaulted: 22000,
        },
        {
          quarter: "Q1 2025",
          disbursed: 285000,
          repaid: 270000,
          defaulted: 15000,
        },
      ],
    },
    alerts: [
      {
        id: 1,
        type: "warning",
        message: "7 loans overdue for more than 5 days",
        time: "3 hours ago",
      },
      {
        id: 2,
        type: "info",
        message: "New credit history available for 12 borrowers",
        time: "5 hours ago",
      },
      {
        id: 3,
        type: "success",
        message: "System integration with Lesotho Credit Bureau completed",
        time: "1 day ago",
      },
      {
        id: 4,
        type: "danger",
        message:
          "Potential fraud detected: multiple loan applications from same household",
        time: "2 days ago",
      },
    ],
    creditScores: {
      excellent: 125,
      good: 230,
      fair: 110,
      poor: 47,
    },
    repaymentRates: {
      onTime: 82,
      late1to15: 12,
      late16to30: 4,
      defaulted: 2,
    },
  };

  useEffect(() => {
    // Check for auth token
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    /*if (!token) {
      navigate("/login");
      return;
    }*/

    // Fetch user data
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/auth/user/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Redirect to login if unauthorized
        if (error.response?.status === 401) {
          localStorage.removeItem("authToken");
          sessionStorage.removeItem("authToken");
          navigate("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    // In a real app, fetch actual loan data
    // For this demo, we'll use the mock data after a timeout to simulate API call
    setTimeout(() => {
      setLoansData(dashboardData.recentLoans);
      fetchUserData();
    }, 1000);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
    navigate("/login");
  };

  const filterLoans = (loans) => {
    if (!loans) return [];

    return loans.filter((loan) => {
      const matchesSearch =
        loan.borrower.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loan.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter =
        filterStatus === "all" || loan.status === filterStatus;

      return matchesSearch && matchesFilter;
    });
  };

  const getLoanStatusClass = (status) => {
    switch (status) {
      case "Active":
        return "status-active";
      case "Overdue":
        return "status-overdue";
      case "Completed":
        return "status-completed";
      case "Pending":
        return "status-pending";
      case "Approved":
        return "status-approved";
      case "Rejected":
        return "status-rejected";
      case "Under Review":
        return "status-review";
      default:
        return "";
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div
      className={`dashboard-container ${
        sidebarCollapsed ? "collapsed-sidebar" : ""
      }`}
    >
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          {sidebarCollapsed ? (
            <div className="logo-icon">L</div>
          ) : (
            <h1 className="logo">Letsema</h1>
          )}
          <button
            className="collapse-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? (
              <ChevronRight size={20} />
            ) : (
              <ChevronLeft size={20} />
            )}
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li className={activeTab === "overview" ? "active" : ""}>
              <button onClick={() => setActiveTab("overview")}>
                <BarChart2 size={20} />
                {!sidebarCollapsed && <span>Dashboard</span>}
              </button>
            </li>
            <li className={activeTab === "loans" ? "active" : ""}>
              <button onClick={() => setActiveTab("loans")}>
                <DollarSign size={20} />
                {!sidebarCollapsed && <span>Loans</span>}
              </button>
            </li>
            <li className={activeTab === "applications" ? "active" : ""}>
              <button onClick={() => setActiveTab("applications")}>
                <FileText size={20} />
                {!sidebarCollapsed && <span>Applications</span>}
              </button>
            </li>
            <li className={activeTab === "borrowers" ? "active" : ""}>
              <button onClick={() => setActiveTab("borrowers")}>
                <Users size={20} />
                {!sidebarCollapsed && <span>Borrowers</span>}
              </button>
            </li>
            <li className={activeTab === "reports" ? "active" : ""}>
              <button onClick={() => setActiveTab("reports")}>
                <PieChart size={20} />
                {!sidebarCollapsed && <span>Reports</span>}
              </button>
            </li>
          </ul>
        </nav>

        {!sidebarCollapsed && (
          <div className="sidebar-footer">
            <p>Letsema MFI Platform v1.0</p>
            <p>© 2025 NUL MACS Project</p>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search for loans, borrowers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="header-actions">
            <button className="notification-btn">
              <AlertTriangle size={20} />
              <span className="notification-count">
                {dashboardData.alerts.length}
              </span>
            </button>

            <div
              className="user-profile"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="avatar">{userData?.name?.charAt(0) || "U"}</div>
              <div className="user-info">
                <p>{userData?.name || "MFI Admin"}</p>
                <span>{userData?.institution || "Lesotho MFI"}</span>
              </div>
              {showUserMenu ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}

              {showUserMenu && (
                <div className="user-menu">
                  <button onClick={() => navigate("/profile")}>
                    <User size={16} />
                    Profile
                  </button>
                  <button onClick={handleLogout}>
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="dashboard-content">
          {activeTab === "overview" && (
            <motion.div
              className="overview-tab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="page-title">
                <h2>Dashboard Overview</h2>
                <p>Welcome back! Here's what's happening in your MFI today.</p>
              </div>

              {/* Stats Cards */}
              <div className="stats-grid">
                <motion.div
                  className="stat-card"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                >
                  <div className="stat-icon">
                    <DollarSign size={24} />
                  </div>
                  <div className="stat-content">
                    <h3>Active Loans</h3>
                    <p className="stat-value">
                      {dashboardData.stats.activeLoans}
                    </p>
                    <p className="stat-desc">
                      Total: M
                      {dashboardData.stats.disbursedAmount.toLocaleString()}
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  className="stat-card"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  <div className="stat-icon">
                    <Users size={24} />
                  </div>
                  <div className="stat-content">
                    <h3>Total Borrowers</h3>
                    <p className="stat-value">
                      {dashboardData.stats.totalBorrowers}
                    </p>
                    <p className="stat-desc">
                      Avg. Loan: M{dashboardData.stats.averageLoanAmount}
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  className="stat-card"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                >
                  <div className="stat-icon">
                    <FileText size={24} />
                  </div>
                  <div className="stat-content">
                    <h3>Pending Applications</h3>
                    <p className="stat-value">
                      {dashboardData.stats.pendingApplications}
                    </p>
                    <p className="stat-desc">Waiting for approval</p>
                  </div>
                </motion.div>

                <motion.div
                  className="stat-card"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                >
                  <div className="stat-icon alert">
                    <AlertTriangle size={24} />
                  </div>
                  <div className="stat-content">
                    <h3>Default Rate</h3>
                    <p className="stat-value">
                      {dashboardData.stats.defaultRate}%
                    </p>
                    <p className="stat-desc">Last month: 6.1%</p>
                  </div>
                </motion.div>
              </div>

              {/* Performance Charts Section */}
              <div className="dashboard-charts">
                <div className="chart-container">
                  <div className="chart-header">
                    <h3>Loan Performance</h3>
                    <div className="chart-actions">
                      <div className="period-selector">
                        <button
                          className={period === "monthly" ? "active" : ""}
                          onClick={() => setPeriod("monthly")}
                        >
                          Monthly
                        </button>
                        <button
                          className={period === "quarterly" ? "active" : ""}
                          onClick={() => setPeriod("quarterly")}
                        >
                          Quarterly
                        </button>
                      </div>
                      <button className="chart-download">
                        <Download size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="performance-chart">
                    {/* In a real app, use a charting library like recharts */}
                    <div className="chart-placeholder">
                      {period === "monthly" ? (
                        <div className="bar-chart">
                          {dashboardData.loanPerformance.monthly.map(
                            (data, index) => (
                              <div className="chart-month" key={index}>
                                <div className="bar-group">
                                  <div
                                    className="bar disbursed"
                                    style={{
                                      height: `${
                                        (data.disbursed / 110000) * 100
                                      }%`,
                                    }}
                                    title={`Disbursed: M${data.disbursed.toLocaleString()}`}
                                  ></div>
                                  <div
                                    className="bar repaid"
                                    style={{
                                      height: `${
                                        (data.repaid / 110000) * 100
                                      }%`,
                                    }}
                                    title={`Repaid: M${data.repaid.toLocaleString()}`}
                                  ></div>
                                  <div
                                    className="bar defaulted"
                                    style={{
                                      height: `${
                                        (data.defaulted / 110000) * 100
                                      }%`,
                                    }}
                                    title={`Defaulted: M${data.defaulted.toLocaleString()}`}
                                  ></div>
                                </div>
                                <div className="bar-label">{data.month}</div>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <div className="bar-chart">
                          {dashboardData.loanPerformance.quarterly.map(
                            (data, index) => (
                              <div className="chart-quarter" key={index}>
                                <div className="bar-group">
                                  <div
                                    className="bar disbursed"
                                    style={{
                                      height: `${
                                        (data.disbursed / 330000) * 100
                                      }%`,
                                    }}
                                    title={`Disbursed: M${data.disbursed.toLocaleString()}`}
                                  ></div>
                                  <div
                                    className="bar repaid"
                                    style={{
                                      height: `${
                                        (data.repaid / 330000) * 100
                                      }%`,
                                    }}
                                    title={`Repaid: M${data.repaid.toLocaleString()}`}
                                  ></div>
                                  <div
                                    className="bar defaulted"
                                    style={{
                                      height: `${
                                        (data.defaulted / 330000) * 100
                                      }%`,
                                    }}
                                    title={`Defaulted: M${data.defaulted.toLocaleString()}`}
                                  ></div>
                                </div>
                                <div className="bar-label">{data.quarter}</div>
                              </div>
                            )
                          )}
                        </div>
                      )}

                      <div className="chart-legend">
                        <div className="legend-item">
                          <span className="legend-color disbursed"></span>
                          <span>Disbursed</span>
                        </div>
                        <div className="legend-item">
                          <span className="legend-color repaid"></span>
                          <span>Repaid</span>
                        </div>
                        <div className="legend-item">
                          <span className="legend-color defaulted"></span>
                          <span>Defaulted</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="charts-secondary">
                  <div className="mini-chart">
                    <h3>Credit Scores</h3>
                    <div className="pie-chart-container">
                      <div className="pie-chart">
                        <div
                          className="pie-segment excellent"
                          style={{
                            transform: "rotate(0deg)",
                            clip: "rect(0px, 75px, 150px, 0px)",
                            backgroundColor: "#4CAF50",
                            clipPath: `inset(0 0 ${
                              100 -
                              (dashboardData.creditScores.excellent /
                                (dashboardData.creditScores.excellent +
                                  dashboardData.creditScores.good +
                                  dashboardData.creditScores.fair +
                                  dashboardData.creditScores.poor)) *
                                100
                            }% 0)`,
                          }}
                        ></div>
                        <div
                          className="pie-segment good"
                          style={{
                            transform: "rotate(90deg)",
                            clip: "rect(0px, 75px, 150px, 0px)",
                            backgroundColor: "#8BC34A",
                            clipPath: `inset(0 0 ${
                              100 -
                              (dashboardData.creditScores.good /
                                (dashboardData.creditScores.excellent +
                                  dashboardData.creditScores.good +
                                  dashboardData.creditScores.fair +
                                  dashboardData.creditScores.poor)) *
                                100
                            }% 0)`,
                          }}
                        ></div>
                        <div
                          className="pie-segment fair"
                          style={{
                            transform: "rotate(180deg)",
                            clip: "rect(0px, 75px, 150px, 0px)",
                            backgroundColor: "#FFC107",
                            clipPath: `inset(0 0 ${
                              100 -
                              (dashboardData.creditScores.fair /
                                (dashboardData.creditScores.excellent +
                                  dashboardData.creditScores.good +
                                  dashboardData.creditScores.fair +
                                  dashboardData.creditScores.poor)) *
                                100
                            }% 0)`,
                          }}
                        ></div>
                        <div
                          className="pie-segment poor"
                          style={{
                            transform: "rotate(270deg)",
                            clip: "rect(0px, 75px, 150px, 0px)",
                            backgroundColor: "#F44336",
                            clipPath: `inset(0 0 ${
                              100 -
                              (dashboardData.creditScores.poor /
                                (dashboardData.creditScores.excellent +
                                  dashboardData.creditScores.good +
                                  dashboardData.creditScores.fair +
                                  dashboardData.creditScores.poor)) *
                                100
                            }% 0)`,
                          }}
                        ></div>
                      </div>
                      <div className="pie-legend">
                        <div className="legend-item">
                          <span
                            className="legend-color"
                            style={{ backgroundColor: "#4CAF50" }}
                          ></span>
                          <span>
                            Excellent ({dashboardData.creditScores.excellent})
                          </span>
                        </div>
                        <div className="legend-item">
                          <span
                            className="legend-color"
                            style={{ backgroundColor: "#8BC34A" }}
                          ></span>
                          <span>Good ({dashboardData.creditScores.good})</span>
                        </div>
                        <div className="legend-item">
                          <span
                            className="legend-color"
                            style={{ backgroundColor: "#FFC107" }}
                          ></span>
                          <span>Fair ({dashboardData.creditScores.fair})</span>
                        </div>
                        <div className="legend-item">
                          <span
                            className="legend-color"
                            style={{ backgroundColor: "#F44336" }}
                          ></span>
                          <span>Poor ({dashboardData.creditScores.poor})</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mini-chart">
                    <h3>Repayment Rates</h3>
                    <div className="gauge-chart">
                      <div
                        className="gauge-value"
                        style={{
                          width: `${dashboardData.repaymentRates.onTime}%`,
                        }}
                      >
                        {dashboardData.repaymentRates.onTime}%
                      </div>
                      <div className="gauge-metrics">
                        <div className="gauge-metric">
                          <span className="metric-label">On Time</span>
                          <span className="metric-value">
                            {dashboardData.repaymentRates.onTime}%
                          </span>
                        </div>
                        <div className="gauge-metric">
                          <span className="metric-label">1-15 Days Late</span>
                          <span className="metric-value">
                            {dashboardData.repaymentRates.late1to15}%
                          </span>
                        </div>
                        <div className="gauge-metric">
                          <span className="metric-label">16-30 Days Late</span>
                          <span className="metric-value">
                            {dashboardData.repaymentRates.late16to30}%
                          </span>
                        </div>
                        <div className="gauge-metric">
                          <span className="metric-label">Defaulted</span>
                          <span className="metric-value">
                            {dashboardData.repaymentRates.defaulted}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Tables Section */}
              <div className="dashboard-tables">
                <div className="table-container">
                  <div className="table-header">
                    <h3>Recent Loans</h3>
                    <a href="#" className="view-all">
                      View All
                    </a>
                  </div>

                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Loan ID</th>
                        <th>Borrower</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Days Overdue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.recentLoans.map((loan, index) => (
                        <tr key={index}>
                          <td>{loan.id}</td>
                          <td>{loan.borrower}</td>
                          <td>M{loan.amount.toLocaleString()}</td>
                          <td>
                            <span
                              className={`status-badge ${getLoanStatusClass(
                                loan.status
                              )}`}
                            >
                              {loan.status}
                            </span>
                          </td>
                          <td>{loan.date}</td>
                          <td>
                            {loan.daysOverdue > 0 ? (
                              <span className="overdue">
                                {loan.daysOverdue} days
                              </span>
                            ) : (
                              "None"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="table-container">
                  <div className="table-header">
                    <h3>Alerts & Notifications</h3>
                    <button className="refresh-btn">
                      <RefreshCw size={16} />
                    </button>
                  </div>

                  <div className="alerts-list">
                    {dashboardData.alerts.map((alert, index) => (
                      <div className={`alert-item ${alert.type}`} key={index}>
                        <div className="alert-icon">
                          {alert.type === "warning" && (
                            <AlertTriangle size={20} />
                          )}
                          {alert.type === "info" && <RefreshCw size={20} />}
                          {alert.type === "success" && (
                            <CheckCircle size={20} />
                          )}
                          {alert.type === "danger" && <XCircle size={20} />}
                        </div>
                        <div className="alert-content">
                          <p>{alert.message}</p>
                          <span className="alert-time">{alert.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "loans" && (
            <motion.div
              className="loans-tab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="page-title">
                <h2>Loan Management</h2>
                <p>View and manage all active and past loans.</p>
              </div>

              <div className="loans-filters">
                <div className="search-bar">
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder="Search by borrower name or loan ID"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="filter-actions">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="status-filter"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Completed">Completed</option>
                  </select>

                  <button className="filter-button">
                    <Filter size={16} />
                    More Filters
                  </button>

                  <button className="export-button">
                    <Download size={16} />
                    Export
                  </button>
                </div>
              </div>

              <div className="loans-list">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Loan ID</th>
                      <th>Borrower</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Disbursement Date</th>
                      <th>Days Overdue</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filterLoans(loansData).map((loan, index) => (
                      <tr key={index}>
                        <td>{loan.id}</td>
                        <td>{loan.borrower}</td>
                        <td>M{loan.amount.toLocaleString()}</td>
                        <td>
                          <span
                            className={`status-badge ${getLoanStatusClass(
                              loan.status
                            )}`}
                          >
                            {loan.status}
                          </span>
                        </td>
                        <td>{loan.date}</td>
                        <td>
                          {loan.daysOverdue > 0 ? (
                            <span className="overdue">
                              {loan.daysOverdue} days
                            </span>
                          ) : (
                            "None"
                          )}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="view-btn">View</button>
                            <button className="edit-btn">Edit</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === "applications" && (
            <motion.div
              className="applications-tab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="page-title">
                <h2>Loan Applications</h2>
                <p>Manage and process new loan applications.</p>
              </div>

              <div className="applications-list">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Application ID</th>
                      <th>Borrower</th>
                      <th>Amount Requested</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Credit Score</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.loanApplications.map((app, index) => (
                      <tr key={index}>
                        <td>{app.id}</td>
                        <td>{app.borrower}</td>
                        <td>M{app.amount.toLocaleString()}</td>
                        <td>
                          <span
                            className={`status-badge ${getLoanStatusClass(
                              app.status
                            )}`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td>{app.date}</td>
                        <td>
                          <div className="credit-score">
                            <div
                              className="score-bar"
                              style={{
                                width: `${app.creditScore}%`,
                                backgroundColor:
                                  app.creditScore > 70
                                    ? "#4CAF50"
                                    : app.creditScore > 60
                                    ? "#FFC107"
                                    : "#F44336",
                              }}
                            ></div>
                            <span>{app.creditScore}</span>
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="review-btn">Review</button>
                            {app.status === "Pending" && (
                              <>
                                <button className="approve-btn">Approve</button>
                                <button className="reject-btn">Reject</button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === "borrowers" && (
            <motion.div
              className="borrowers-tab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="page-title">
                <h2>Borrower Management</h2>
                <p>View and manage all borrower profiles and histories.</p>
              </div>

              <div className="borrowers-placeholder">
                <div className="placeholder-icon">
                  <Users size={48} />
                </div>
                <h3>Borrower Management Coming Soon</h3>
                <p>
                  This feature is currently under development. Check back later.
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === "reports" && (
            <motion.div
              className="reports-tab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="page-title">
                <h2>Reports & Analytics</h2>
                <p>Generate and download detailed reports.</p>
              </div>

              <div className="reports-grid">
                <div className="report-card">
                  <div className="report-icon">
                    <TrendingUp size={32} />
                  </div>
                  <h3>Monthly Performance</h3>
                  <p>
                    View detailed performance metrics for loan repayments and
                    defaults.
                  </p>
                  <div className="report-actions">
                    <button className="view-report">View Report</button>
                    <button className="download-report">
                      <Download size={16} />
                    </button>
                  </div>
                </div>

                <div className="report-card">
                  <div className="report-icon">
                    <Users size={32} />
                  </div>
                  <h3>Borrower Demographics</h3>
                  <p>
                    Analyze borrower data by location, age, income, and loan
                    history.
                  </p>
                  <div className="report-actions">
                    <button className="view-report">View Report</button>
                    <button className="download-report">
                      <Download size={16} />
                    </button>
                  </div>
                </div>

                <div className="report-card">
                  <div className="report-icon">
                    <DollarSign size={32} />
                  </div>
                  <h3>Financial Summary</h3>
                  <p>Review income, expenses, and overall financial health.</p>
                  <div className="report-actions">
                    <button className="view-report">View Report</button>
                    <button className="download-report">
                      <Download size={16} />
                    </button>
                  </div>
                </div>

                <div className="report-card">
                  <div className="report-icon">
                    <Clock size={32} />
                  </div>
                  <h3>Late Payments Analysis</h3>
                  <p>Track and analyze late payments and default patterns.</p>
                  <div className="report-actions">
                    <button className="view-report">View Report</button>
                    <button className="download-report">
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
