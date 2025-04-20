import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { motion } from "framer-motion";
import "./App.css";
import Dashboard from "./components/Dashboard/Dashboard";
import UserRegistration from "./components/UserRegistration/UserRegistration";
import UserLogin from "./components/UserLogin/UserLogin";
import LandingPage from "./components/LandingPage/LandingPage";
import MFIRegistration from "./components/MFIRegistration/MFIRegistration";
import UserDashboard from "./components/UserDashboard/UserDashboard";

function App() {
  // Add authenticated state at the App level
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/register"
            element={
              <>
                <main>
                  <UserRegistration setIsAuthenticated={setIsAuthenticated} />
                </main>
              </>
            }
          />
          <Route
            path="/registerMFI"
            element={
              <>
                <main>
                  <MFIRegistration setIsAuthenticated={setIsAuthenticated} />
                </main>
              </>
            }
          />
          <Route
            path="/login"
            element={
              <>
                <main>
                  <UserLogin setIsAuthenticated={setIsAuthenticated} />
                </main>
              </>
            }
          />
          <Route
            path="/dashboard"
            element={
              <>
                <main>
                  <Dashboard isAuthenticated={isAuthenticated} />
                </main>
              </>
            }
          />
          <Route
            path="/userdashboard"
            element={
              <>
                <main>
                  <UserDashboard isAuthenticated={isAuthenticated} />
                </main>
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
