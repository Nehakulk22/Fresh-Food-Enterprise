import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../im1.png";

function Login({ onLogin }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:8000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      onLogin(data.user);

      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);

      alert(
        "Unable to connect to server. Please make sure the backend is running."
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">

        {/* LEFT SECTION */}

        <div className="auth-left">

          <div className="logo-section">

            <div className="logo-section">
              <div className="logo-icon">
                <img
                  src={logo}
                  alt="Fresh Food Enterprises Logo"
                />
              </div>

              <div>
                <h1>Fresh Food</h1>
                <p>Fresh Food Enterprises</p>
              </div>
            </div>

          </div>

          <div className="welcome-section">

            <h2>
              Manage your
              <br />
              business smarter.
            </h2>

            <p>
              Manage your sales, purchases,
              customers, suppliers and payments
              in one simple platform.
            </p>

          </div>

          <div className="left-footer">

            <span>Sales</span>
            <span>Purchases</span>
            <span>Payments</span>
            <span>Reports</span>

          </div>

        </div>

        {/* RIGHT SECTION */}

        <div className="auth-right">

          <div className="auth-card">

            <div className="auth-heading">

              <h2>
                Welcome Back!
              </h2>

              <p>
                Login to your Fresh Food Enterprises account
              </p>

            </div>

            {/* LOGIN / SIGNUP TABS */}

            <div className="auth-tabs">

              <button
                type="button"
                className="tab active"
              >
                Login
              </button>

              <button
                type="button"
                className="tab"
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </button>

            </div>

            {/* LOGIN FORM */}

            <form onSubmit={handleSubmit}>

              <div className="input-group">

                <label>Email Address</label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                />

              </div>

              <div className="input-group">

                <label>Password</label>

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                />

              </div>

              <div className="form-options">

                <label className="remember">

                  <input type="checkbox" />

                  <span>
                    Remember me
                  </span>

                </label>

                <button
                  type="button"
                  className="forgot-password"
                  onClick={() =>
                    alert(
                      "Forgot password functionality will be added later."
                    )
                  }
                >
                  Forgot Password?
                </button>

              </div>

              <button
                type="submit"
                className="login-button"
              >
                Login
              </button>

            </form>

            {/* BOTTOM SWITCH */}

            <div className="bottom-text">

              <span>
                Don't have an account?
              </span>

              <button
                type="button"
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </button>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Login;