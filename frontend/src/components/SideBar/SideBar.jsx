// Sidebar.jsx
import React from "react";
import "./SideBar.css";
import {
  Home,
  Wallet,
  PlusCircle,
  Building,
  User,
  ChevronDown,
  ChevronUp,
  LogOut,
} from "lucide-react";
import { clearAuthData } from "../../utils/authUtils"; // Import the clearAuthData function

const SideBar = ({
  activeTab,
  sidebarCollapsed,
  setActiveTab,
  setSidebarCollapsed,
}) => {
  const handleLogout = () => {
    // Use the clearAuthData utility function to properly clear all auth data
    clearAuthData();
    
    // Redirect to login page
    window.location.href = "/login"; // or use router navigation if using React Router
  };

  return (
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
            <ChevronDown size={20} />
          ) : (
            <ChevronUp size={20} />
          )}
        </button>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {["overview", "loans", "apply", "mfi", "profile"].map((tab) => (
            <li key={tab} className={activeTab === tab ? "active" : ""}>
              <button onClick={() => setActiveTab(tab)}>
                {tab === "overview" && <Home size={20} />}
                {tab === "loans" && <Wallet size={20} />}
                {tab === "apply" && <PlusCircle size={20} />}
                {tab === "mfi" && <Building size={20} />}
                {tab === "profile" && <User size={20} />}
                {!sidebarCollapsed && (
                  <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                )}
              </button>
            </li>
          ))}
          
          {/* Logout Button */}
          <li className="logout-item">
            <button onClick={handleLogout}>
              <LogOut size={20} />
              {!sidebarCollapsed && <span>Logout</span>}
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default SideBar;