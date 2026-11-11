
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://127.0.0.1:8000/api";

function AuthorityApprovalStatus() {
    const navigate = useNavigate();

    const [authority, setAuthority] = useState(null);
    const [institutions, setInstitutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case "approved":
                return "bg-green-100 text-green-700";
            case "rejected":
                return "bg-red-100 text-red-700";
            case "pending":
                return "bg-yellow-100 text-yellow-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const formatStatus = (status) => {
        if (!status) return "Unknown";
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    const formatDate = (date) => {
        if (!date) return "Not available";

        return new Date(date).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
        });
    };

    const fetchApprovalStatus = async () => {
        setLoading(true);
        setError("");

        const token =
            localStorage.getItem("access_token") ||
            localStorage.getItem("access");

        if (!token) {
            setError("Your login session was not found. Please log in again.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(
                `${API}/users/authority-approval-status/`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    data.error ||
                    "Unable to load approval information."
                );
            }

            setAuthority(data.authority);
            setInstitutions(data.institutions || []);
        } catch (err) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApprovalStatus();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-5 md:p-8">
            <div className="mx-auto max-w-5xl">

                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <button
                        onClick={() => navigate("/authority")}
                        className="rounded-lg bg-gray-700 px-5 py-2 text-white transition hover:bg-gray-800"
                    >
                        ← Back to Dashboard
                    </button>

                    <button
                        onClick={fetchApprovalStatus}
                        disabled={loading}
                        className="rounded-lg bg-blue-600 px-5 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Refreshing..." : "↻ Refresh Status"}
                    </button>
                </div>

                <div className="mb-6 rounded-xl bg-white p-6 shadow">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Approval Status
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Check your authority account and institution
                        submission approval details.
                    </p>
                </div>

                {loading && (
                    <div className="rounded-xl bg-white p-8 text-center shadow">
                        <p className="text-gray-600">
                            Loading approval information...
                        </p>
                    </div>
                )}

                {!loading && error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                        <h2 className="font-semibold text-red-700">
                            Unable to load status
                        </h2>
                        <p className="mt-2 text-sm text-red-600">
                            {error}
                        </p>
                        <button
                            onClick={fetchApprovalStatus}
                            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {!loading && !error && authority && (
                    <>
                        {/* AUTHORITY ACCOUNT STATUS */}
                        <div className="mb-6 rounded-xl bg-white p-6 shadow">
                            <h2 className="mb-4 text-xl font-semibold text-gray-800">
                                Authority Account
                            </h2>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Name
                                    </p>
                                    <p className="font-medium text-gray-800">
                                        {authority.name || "Not available"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Username
                                    </p>
                                    <p className="font-medium text-gray-800">
                                        {authority.username}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Email
                                    </p>
                                    <p className="font-medium text-gray-800">
                                        {authority.email || "Not available"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Account Approval
                                    </p>
                                    <span
                                        className={`mt-1 inline-block rounded-full px-3 py-1 text-sm font-semibold ${getStatusStyle(
                                            authority.approval_status
                                        )}`}
                                    >
                                        {formatStatus(authority.approval_status)}
                                    </span>
                                </div>
                            </div>

                            {authority.approval_status === "pending" && (
                                <p className="mt-5 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
                                    Your authority account is waiting for
                                    administrator approval.
                                </p>
                            )}

                            {authority.approval_status === "rejected" && (
                                <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-800">
                                    Your authority account was rejected.
                                    Please contact the administrator for
                                    further information.
                                </p>
                            )}

                            {authority.approval_status === "approved" && (
                                <p className="mt-5 rounded-lg bg-green-50 p-3 text-sm text-green-800">
                                    Your authority account has been approved.
                                </p>
                            )}
                        </div>

                        {/* INSTITUTION SUBMISSION STATUS */}
                        <div className="rounded-xl bg-white p-6 shadow">
                            <h2 className="mb-4 text-xl font-semibold text-gray-800">
                                My Institution Submissions
                            </h2>

                            {institutions.length === 0 ? (
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
                                    <p className="text-gray-600">
                                        You have not submitted any institutions yet.
                                    </p>

                                    {authority.approval_status === "approved" && (
                                        <button
                                            onClick={() =>
                                                navigate("/add-institution")
                                            }
                                            className="mt-4 rounded-lg bg-green-600 px-5 py-2 text-white hover:bg-green-700"
                                        >
                                            Add Institution
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {institutions.map((institution) => (
                                        <div
                                            key={institution.id}
                                            className="rounded-lg border border-gray-200 p-4 transition hover:shadow-sm"
                                        >
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-800">
                                                        {institution.name}
                                                    </h3>

                                                    <p className="mt-1 text-sm text-gray-500">
                                                        {institution.education_level
                                                            ? institution.education_level.replaceAll("_", " ")
                                                            : "Education level not available"}
                                                    </p>

                                                    <p className="mt-1 text-sm text-gray-500">
                                                        {[
                                                            institution.location,
                                                            institution.district,
                                                            institution.state,
                                                        ]
                                                            .filter(Boolean)
                                                            .join(", ") || "Location not available"}
                                                    </p>
                                                </div>

                                                <span
                                                    className={`rounded-full px-3 py-1 text-sm font-semibold ${getStatusStyle(
                                                        institution.approval_status
                                                    )}`}
                                                >
                                                    {formatStatus(institution.approval_status)}
                                                </span>
                                            </div>

                                            <div className="mt-4 border-t pt-3 text-xs text-gray-500">
                                                Submitted: {formatDate(institution.created_at)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default AuthorityApprovalStatus;
