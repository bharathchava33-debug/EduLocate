
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const API = "http://127.0.0.1:8000/api/users";

function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${API}/forgot-password/`,
        { email }
      );

      setMessage(response.data.message);
      setStep(2);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        "Unable to send verification code."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${API}/verify-reset-code/`,
        { email, code }
      );

      setResetToken(response.data.reset_token);
      setMessage("Email verified successfully.");
      setStep(3);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        "Verification failed. Please check your code."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API}/reset-password/`,
        {
          email,
          reset_token: resetToken,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }
      );

      setMessage(
        response.data.message + " Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/", { replace: true });
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        "Unable to reset password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 via-white to-purple-100 p-4">

      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

        <h1 className="text-center text-2xl font-extrabold text-blue-700">
          EduLocate
        </h1>

        <h2 className="mt-5 text-center text-xl font-bold text-gray-800">
          Forgot Password?
        </h2>

        <p className="mt-2 text-center text-sm text-gray-500">
          {step === 1 && "Enter your registered email address."}
          {step === 2 && "Enter the verification code sent to your email."}
          {step === 3 && "Create a new password for your account."}
        </p>

        {/* STEP INDICATOR */}

        <div className="my-6 flex items-center justify-center gap-3">
          {[1, 2, 3].map((number) => (
            <div
              key={number}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                step >= number
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {number}
            </div>
          ))}
        </div>

        {/* STEP 1: EMAIL */}

        {step === 1 && (
          <form onSubmit={handleRequestCode}>

            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Registered Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              required
              className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Verification Code"}
            </button>

          </form>
        )}

        {/* STEP 2: VERIFY CODE */}

        {step === 2 && (
          <form onSubmit={handleVerifyCode}>

            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Verification Code
            </label>

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="Enter 6-digit code"
              required
              className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-3 text-center text-lg tracking-widest outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setCode("");
                setError("");
                setMessage("");
              }}
              className="mt-3 w-full text-sm font-semibold text-blue-600 hover:underline"
            >
              Change Email
            </button>

          </form>
        )}

        {/* STEP 3: NEW PASSWORD */}

        {step === 3 && (
          <form onSubmit={handleResetPassword}>

            <label className="mb-1 block text-sm font-semibold text-gray-700">
              New Password
            </label>

            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              autoComplete="new-password"
              minLength={8}
              required
              className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Confirm New Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              autoComplete="new-password"
              minLength={8}
              required
              className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Updating..." : "Reset Password"}
            </button>

          </form>
        )}

        {/* ERROR */}

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {/* SUCCESS */}

        {message && (
          <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            {message}
          </p>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
          Remember your password?{" "}
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

export default ForgotPassword;
