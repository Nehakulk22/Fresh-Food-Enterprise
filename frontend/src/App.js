import React, { useState } from "react";
import "./App.css";

function App() {
  const [isLogin, setIsLogin] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let url;
      let body;

      if (isLogin) {
        // LOGIN
        url = "http://localhost:8000/api/auth/login";

        body = {
          email: email,
          password: password,
        };
      } else {
        // REGISTER OWNER
        url = "http://localhost:8000/api/auth/register-owner";

        body = {
          name: name,
          email: email,
          password: password,
          phone: phone,
        };
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Something went wrong");
        return;
      }

      if (isLogin) {
        // Save authentication information
        localStorage.setItem("token", data.token);
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        alert(
          "Login successful!\n\n" +
          "Welcome " +
          data.user.name +
          "\nRole: " +
          data.user.role
        );

        console.log("Logged in user:", data.user);
        console.log("Token:", data.token);

      } else {

        alert(
          data.message ||
          "Owner account created successfully"
        );

        // Switch back to Login
        setIsLogin(true);

        setName("");
        setEmail("");
        setPassword("");
        setPhone("");
      }

    } catch (error) {

      console.error("Connection error:", error);

      alert(
        "Unable to connect to server. " +
        "Please make sure the backend is running."
      );
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-container">

        {/* LEFT SIDE */}

        <div className="auth-left">

          <div className="logo-section">

            <div className="logo-icon">
              F
            </div>

            <div>
              <h1>FreshLedger</h1>

              <p>
                Fresh Food Enterprises
              </p>
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


        {/* RIGHT SIDE */}

        <div className="auth-right">

          <div className="auth-card">

            <div className="auth-heading">

              <h2>
                {isLogin
                  ? "Welcome Back!"
                  : "Create Owner Account"}
              </h2>

              <p>
                {isLogin
                  ? "Login to your FreshLedger account"
                  : "Create your FreshLedger owner account"}
              </p>

            </div>


            {/* LOGIN / SIGNUP */}

            <div className="auth-tabs">

              <button
                type="button"
                className={
                  isLogin
                    ? "tab active"
                    : "tab"
                }
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>


              <button
                type="button"
                className={
                  !isLogin
                    ? "tab active"
                    : "tab"
                }
                onClick={() => setIsLogin(false)}
              >
                Sign Up
              </button>

            </div>


            <form onSubmit={handleSubmit}>

              {/* NAME */}

              {!isLogin && (

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

              )}


              {/* EMAIL */}

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


              {/* PHONE */}

              {!isLogin && (

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

              )}


              {/* PASSWORD */}

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


              {/* LOGIN OPTIONS */}

              {isLogin && (

                <div className="form-options">

                  <label className="remember">

                    <input
                      type="checkbox"
                    />

                    <span>
                      Remember me
                    </span>

                  </label>


                  <button
                    type="button"
                    className="forgot-password"
                  >
                    Forgot Password?
                  </button>

                </div>

              )}


              {/* SUBMIT */}

              <button
                type="submit"
                className="login-button"
              >
                {isLogin
                  ? "Login"
                  : "Create Account"}
              </button>

            </form>


            {/* SWITCH */}

            <div className="bottom-text">

              <span>
                {isLogin
                  ? "Don't have an account?"
                  : "Already have an account?"}
              </span>

              <button
                type="button"
                onClick={() =>
                  setIsLogin(!isLogin)
                }
              >
                {isLogin
                  ? "Sign Up"
                  : "Login"}
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default App;