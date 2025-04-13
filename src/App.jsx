import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import RegisterPage from "./pages/Authentication/RegisterPage.jsx";
import LoginPage from "./pages/Authentication/LoginPage.jsx";
import ProtectedRoute from "./pages/Authentication/ProtectedRoute.jsx";
import DashboardPage from "./pages/components/DashboardPage.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={<ProtectedRoute element={<DashboardPage />} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
