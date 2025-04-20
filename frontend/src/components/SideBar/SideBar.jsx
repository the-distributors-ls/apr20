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
} from "lucide-react";

const SideBar = ({
  activeTab,
  sidebarCollapsed,
  setActiveTab,
  setSidebarCollapsed,
}) => {
  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-header">
        <h1 className="logo">Letsema</h1>
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
        </ul>
      </nav>
    </aside>
  );
};

export default SideBar;
