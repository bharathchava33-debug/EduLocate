
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/users/login/",
        {
          username: username.trim(),
          password,
        }
      );

      const data = response.data;

      const actualRole = String(data.role || "")
        .trim()
        .toLowerCase();

      // Validate role
      if (!["student", "admin", "authority"].includes(actualRole)) {
        setError("Invalid account role. Please contact Admin.");
        return;
      }

      // Validate tokens
      if (!data.access || !data.refresh) {
        setError("Login successful, but authentication tokens are missing.");
        return;
      }

      // Clear old authentication data
      const oldKeys = [
        "access_token",
        "refresh_token",
        "access",
        "refresh",
        "username",
        "email",
        "name",
        "role",
        "edulocate_logged_in",
      ];

      oldKeys.forEach((key) => localStorage.removeItem(key));

      // Save new authentication data
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      localStorage.setItem("username", data.username || username.trim());
      localStorage.setItem("email", data.email || "");
      localStorage.setItem("name", data.name || "");
      localStorage.setItem("role", actualRole);
      localStorage.setItem("edulocate_logged_in", "true");

      console.log("Login successful");
      console.log("Role:", actualRole);
      console.log("Access token received:", Boolean(data.access));

      // Redirect according to role
      if (actualRole === "student") {
        navigate("/home", { replace: true });
      } else if (actualRole === "authority") {
        navigate("/authority", { replace: true });
      } else {
        navigate("/admin", { replace: true });
      }

    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);

      const errorData = err.response?.data;

      setError(
        errorData?.error ||
        errorData?.detail ||
        "Invalid username or password."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-left">
        <div className="login-brand">
          <div className="brand-icon">🎓</div>
          <span>
            Edu<span>Locate</span>
          </span>
        </div>

        <div className="login-hero">
          <p className="small-heading">
            SMART EDUCATION DISCOVERY
          </p>

          <h1>
            Find the right
            <span> institution </span>
            for your future.
          </h1>

          <p>
            Discover schools, junior colleges and
            engineering colleges based on location,
            fees, courses, distance and ratings.
          </p>

          <div className="login-features">
            <div><span>✓</span> Smart institution search</div>
            <div><span>✓</span> Compare institutions</div>
            <div><span>✓</span> Personalized recommendations</div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">

          <div className="mobile-logo">
            🎓 EduLocate
          </div>

          <h2>Welcome back</h2>

          <p className="login-subtitle">
            Login to continue exploring institutions
          </p>

          <form onSubmit={handleLogin}>

            <div className="input-group">
              <label>Username</label>

              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <div className="login-options">
              <span></span>

              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="forgot-button"
              >
                Forgot Password?
              </button>
            </div>

            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
              {!loading && <span>→</span>}
            </button>

          </form>

          <div className="divider">
            <span>or</span>
          </div>

          <p className="register-text">
            Don't have an account?
            <Link to="/register">Create Account</Link>
          </p>

        </div>
      </div>

    </div>
  );
}

export default Login;
