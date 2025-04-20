// NavBar.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import "./NavBar.css";

const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const location = useLocation();

  // Hide header on homepage, show on other pages
  const isHomePage = location.pathname === "/";

  // Add scroll listener to change navbar appearance on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMenuOpen &&
        !event.target.closest(".navbar-links") &&
        !event.target.closest(".navbar-menu-toggle")
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isMenuOpen]);

  // Close mobile menu on location change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Determine navbar style based on page and scroll
  const navClass = `navbar ${
    isScrolled || !isHomePage ? "navbar-scrolled" : ""
  } ${isHomePage ? "navbar-home" : "navbar-page"}`;

  // Animation variants
  const navAnimation = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  };

  const toggleDropdown = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  return (
    <motion.nav
      className={navClass}
      initial="hidden"
      animate="visible"
      variants={navAnimation}
      transition={{ duration: 0.5 }}
    >
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-text">Letsema</span>
          <span className="logo-badge">MFI Network</span>
        </Link>

        <div
          className="navbar-menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <div className="menu-icon-container">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </div>
        </div>

        <div className={`navbar-links-container ${isMenuOpen ? "active" : ""}`}>
          <ul className="navbar-links">
            <li className="nav-item">
              <Link
                to="/"
                className={location.pathname === "/" ? "active" : ""}
              >
                Home
              </Link>
            </li>
            <li className="nav-item dropdown">
              <button
                className="dropdown-toggle"
                onClick={() => toggleDropdown(0)}
              >
                Platform{" "}
                <ChevronDown
                  size={16}
                  className={`dropdown-icon ${
                    activeDropdown === 0 ? "rotated" : ""
                  }`}
                />
              </button>
              <div
                className={`dropdown-menu ${
                  activeDropdown === 0 ? "open" : ""
                }`}
              >
                <Link to="#">Features</Link>
                <Link to="#">How It Works</Link>
                <Link to="#">Security</Link>
                <Link to="#">API Documentation</Link>
              </div>
            </li>
            <li className="nav-item dropdown">
              <button
                className="dropdown-toggle"
                onClick={() => toggleDropdown(1)}
              >
                Resources{" "}
                <ChevronDown
                  size={16}
                  className={`dropdown-icon ${
                    activeDropdown === 1 ? "rotated" : ""
                  }`}
                />
              </button>
              <div
                className={`dropdown-menu ${
                  activeDropdown === 1 ? "open" : ""
                }`}
              >
                <Link to="#">Case Studies</Link>
                <Link to="#">MFI Partners</Link>
                <Link to="#">Documentation</Link>
                <Link to="#">Support Center</Link>
              </div>
            </li>
            <li className="nav-item">
              <Link to="#">About</Link>
            </li>
          </ul>
          <div className="navbar-cta">
            <Link to="/login" className="btn-secondary navbar-btn">
              Login
            </Link>
            <Link to="/registerMFI" className="btn-primary navbar-btn">
              Register MFI
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default NavBar;
