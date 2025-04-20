// Header.jsx
import React from "react";
import "./Header.css";
import { ChevronDown } from "lucide-react";

const Header = ({ userData, showUserMenu, setShowUserMenu }) => {
  return (
    <header className="dashboard-header">
      <div
        className="user-profile"
        onClick={() => setShowUserMenu(!showUserMenu)}
      >
        <div className="avatar">{userData.name.charAt(0)}</div>
        <div className="user-info">
          <p>{userData.name}</p>
          <span>{userData.mfi}</span>
        </div>
        <ChevronDown size={16} />
      </div>
    </header>
  );
};

export default Header;
