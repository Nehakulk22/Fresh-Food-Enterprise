import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../im1.png"
function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:8000/api/auth/register-owner",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
            phone,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Registration failed");
        return;
      }

      alert(
        data.message ||
          "Owner account created successfully"
      );

      setName("");
      setEmail("");
      setPhone("");
      setPassword("");

      navigate("/login");
    } catch (error) {
      console.error("Signup error:", error);

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
                Create Owner Account
              </h2>

              <p>
                Create your Fresh Food Enterprises owner account
              </p>

            </div>

            {/* LOGIN / SIGNUP TABS */}

            <div className="auth-tabs">

              <button
                type="button"
                className="tab"
                onClick={() => navigate("/login")}
              >
                Login
              </button>

              <button
                type="button"
                className="tab active"
              >
                Sign Up
              </button>

            </div>

            {/* SIGNUP FORM */}

            <form onSubmit={handleSubmit}>

              <div className="input-group">

                <label>
                  Full Name
                </label>

                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  required
                />

              </div>

              <div className="input-group">

                <label>
                  Email Address
                </label>

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

                <label>
                  Phone Number
                </label>

                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                />

              </div>

              <div className="input-group">

                <label>
                  Password
                </label>

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

              <button
                type="submit"
                className="login-button"
              >
                Create Account
              </button>

            </form>

            {/* BOTTOM SWITCH */}

            <div className="bottom-text">

              <span>
                Already have an account?
              </span>

              <button
                type="button"
                onClick={() => navigate("/login")}
              >
                Login
              </button>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Signup;