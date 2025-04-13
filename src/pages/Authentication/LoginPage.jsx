
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api.js";
import "bootstrap/dist/css/bootstrap.min.css"; 

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/login", formData);
      console.log("res", res);
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
      alert("Login successful!");
    } catch (error) {
      console.log("error", error);
      setError("Invalid email or password.");
    }
  };

  const register = () => {
    navigate("/register");
  };

  return (
    // <div className="container d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg p-4 rounded" style={{ maxWidth: "400px", width: "100%" }}>
        <h2 className="text-center mb-4">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="d-grid">
            <button type="submit" className="btn btn-primary">
              Login
            </button>
          </div>
        </form>
        <div className="mt-3 text-center">
          Don't have an account?{" "}
          <button onClick={register} className="btn btn-link">
            Register here
          </button>
        </div>
      </div>
    // {/* </div> */}
  );
};

export default LoginPage;