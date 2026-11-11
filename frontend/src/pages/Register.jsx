
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const roles = [
    {
      value: "student",
      title: "User",
      description: "Search and explore institutions",
      icon: "🎓",
      color: "blue",
    },
    {
      value: "authority",
      title: "Institution Authority",
      description: "Add and manage your institution",
      icon: "🏫",
      color: "green",
    },
  ];

  const selectedStyles = {
    blue: "border-blue-500 bg-blue-50",
    green: "border-green-500 bg-green-50",
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Password and Re-enter Password do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/users/register/",
        {
          name,
          username,
          email,
          password,
          confirm_password: confirmPassword,
          role,
        }
      );

      setMessage(
        response.data.message || "Registered successfully!"
      );

      // Clear registration form
      setName("");
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      // Redirect to login after displaying success message
      setTimeout(() => {
        navigate("/");
      }, 2500);

    } catch (err) {
      const data = err.response?.data;

      const errorMessage =
        data?.error ||
        data?.detail ||
        data?.message ||
        (data && typeof data === "object"
          ? Object.entries(data)
              .map(([field, messages]) => {
                const value = Array.isArray(messages)
                  ? messages.join(", ")
                  : String(messages);

                return `${field}: ${value}`;
              })
              .join(" | ")
          : "") ||
        "Registration failed. Please check your details.";

      setError(errorMessage);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 via-white to-purple-100 p-3">

      <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-lg transition-all duration-300 hover:shadow-xl">

        <h1 className="text-center text-2xl font-extrabold text-blue-700">
          EduLocate
        </h1>

        <p className="mt-1 text-center text-xs text-gray-500">
          Find the right institution for your future
        </p>

        <h2 className="mt-4 text-center text-xl font-bold text-gray-800">
          Create Account
        </h2>

        <p className="mb-4 mt-1 text-center text-sm text-gray-500">
          Join EduLocate today
        </p>

        <form onSubmit={handleRegister}>

          {/* ROLE SELECTION */}

          <div className="mb-4">

            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Select Your Role
            </label>

            <div className="grid grid-cols-2 gap-2">

              {roles.map((item) => (

                <button
                  key={item.value}
                  type="button"
                  aria-pressed={role === item.value}
                  onClick={() => setRole(item.value)}
                  className={`min-h-24 rounded-lg border p-2 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                    role === item.value
                      ? `${selectedStyles[item.color]} ring-1 ring-blue-100`
                      : "border-gray-200 bg-white"
                  }`}
                >

                  <span className="block text-xl">
                    {item.icon}
                  </span>

                  <span className="mt-1 block text-xs font-semibold text-gray-800">
                    {item.title}
                  </span>

                  <span className="mt-1 block text-[10px] text-gray-500">
                    {item.description}
                  </span>

                  {role === item.value && (
                    <span className="mt-1 block text-[10px] font-semibold text-blue-700">
                      ✓ Selected
                    </span>
                  )}

                </button>

              ))}

            </div>
          </div>

          {/* NAME */}

          <label className="mb-1 block text-sm font-medium text-gray-700">
            Name
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            autoComplete="name"
            required
            className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          {/* USERNAME */}

          <label className="mb-1 block text-sm font-medium text-gray-700">
            Username
          </label>

          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Create a username"
            autoComplete="username"
            required
            className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          {/* PASSWORD */}

          <label className="mb-1 block text-sm font-medium text-gray-700">
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            autoComplete="new-password"
            minLength={8}
            required
            className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          {/* CONFIRM PASSWORD */}

          <label className="mb-1 block text-sm font-medium text-gray-700">
            Re-enter Password
          </label>

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            autoComplete="new-password"
            minLength={8}
            required
            className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          {/* EMAIL */}

          <label className="mb-1 block text-sm font-medium text-gray-700">
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            autoComplete="email"
            required
            className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          {/* ERROR MESSAGE */}

          {error && (
            <p className="mb-3 rounded-lg bg-red-50 p-2 text-xs text-red-700">
              {error}
            </p>
          )}

          {/* SUCCESS MESSAGE */}

          {message && (
            <p className="mb-3 rounded-lg bg-green-50 p-2 text-xs text-green-700">
              {message}
            </p>
          )}

          {/* REGISTER BUTTON */}

          <button
            type="submit"
            disabled={loading || !!message}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition duration-300 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>

        </form>

        <p className="mt-4 text-center text-xs text-gray-600">

          Already have an account?{" "}

          <Link
            to="/"
            className="font-semibold text-blue-600 hover:underline"
          >
            Login
          </Link>

        </p>

      </div>
    </div>
  );
}

export default Register;
