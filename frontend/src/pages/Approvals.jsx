
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Approvals() {
    const navigate = useNavigate();

    const API_URL = "http://127.0.0.1:8000/api";

    const [authorities, setAuthorities] = useState([]);
    const [institutions, setInstitutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // Always use the access token, never the refresh token.
    const getConfig = () => {
        const token = localStorage.getItem("access_token");

        if (!token) {
            throw new Error("Access token not found. Please log in again.");
        }

        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    };

    // Load approval requests
    const fetchApprovals = useCallback(async () => {
        setLoading(true);
        setError("");
        setMessage("");

        try {
            const config = getConfig();

            const results = await Promise.allSettled([
                axios.get(
                    `${API_URL}/users/authority-requests/`,
                    config
                ),
                axios.get(
                    `${API_URL}/institutions/pending/`,
                    config
                ),
            ]);

            // Authority requests
            if (results[0].status === "fulfilled") {
                const data = results[0].value.data;

                setAuthorities(
                    Array.isArray(data) ? data : data.results || []
                );
            } else {
                console.error(
                    "Authority loading error:",
                    results[0].reason.response?.data ||
                    results[0].reason.message
                );

                setAuthorities([]);
                setError("Unable to load authority requests.");
            }

            // Institution requests
            if (results[1].status === "fulfilled") {
                const data = results[1].value.data;

                setInstitutions(
                    Array.isArray(data) ? data : data.results || []
                );
            } else {
                console.error(
                    "Institution loading error:",
                    results[1].reason.response?.data ||
                    results[1].reason.message
                );

                setInstitutions([]);
                setError((previous) =>
                    previous
                        ? previous + " Unable to load institution requests."
                        : "Unable to load institution requests."
                );
            }

        } catch (err) {
            console.error("Approval loading error:", err);

            setError(
                err.response?.data?.detail ||
                err.message ||
                "Unable to load approval requests."
            );

        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchApprovals();
    }, [fetchApprovals]);

    // Approve or reject authority
    const reviewAuthority = async (id, action) => {
        const actionText = action === "approve" ? "approve" : "reject";

        if (!window.confirm(`Are you sure you want to ${actionText} this authority?`)) {
            return;
        }

        try {
            const config = getConfig();

            // This URL and request body match your Django backend.
            await axios.post(
                `${API_URL}/users/authority-requests/${id}/`,
                { action },
                config
            );

            setMessage(`Authority ${actionText}d successfully.`);
            await fetchApprovals();

        } catch (err) {
            console.error(
                "Authority update error:",
                err.response?.data || err.message
            );

            setError(
                err.response?.data?.detail ||
                err.response?.data?.error ||
                `Unable to ${actionText} authority.`
            );
        }
    };

    // Institution approval
    const reviewInstitution = async (id, action) => {
        const actionText = action === "approve" ? "approve" : "reject";

        if (!window.confirm(`Are you sure you want to ${actionText} this institution?`)) {
            return;
        }

        try {
            const config = getConfig();

            // This endpoint must exist in your Django backend.
            await axios.post(
                `${API_URL}/institutions/${id}/${action}/`,
                {},
                config
            );

            setMessage(`Institution ${actionText}d successfully.`);
            await fetchApprovals();

        } catch (err) {
            console.error(
                "Institution update error:",
                err.response?.data || err.message
            );

            setError(
                err.response?.data?.detail ||
                err.response?.data?.error ||
                `Unable to ${actionText} institution. Check the Django approval endpoint.`
            );
        }
    };

    const pendingAuthorities = authorities.filter(
        (item) =>
            !item.approval_status ||
            item.approval_status === "pending"
    );

    return (
        <div className="min-h-screen bg-gray-100 p-6 md:p-8">

            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        Institution Approvals
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Review pending institution and authority approvals.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={fetchApprovals}
                        className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
                    >
                        Refresh
                    </button>

                    <button
                        onClick={() => navigate("/admin")}
                        className="rounded-lg bg-gray-700 px-5 py-2 text-white hover:bg-gray-800"
                    >
                        Back
                    </button>
                </div>
            </div>

            {message && (
                <div className="mb-4 rounded-lg bg-green-100 p-3 text-green-700">
                    {message}
                </div>
            )}

            {error && (
                <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="rounded-xl bg-white p-8 text-center shadow">
                    Loading approval requests...
                </div>
            ) : (
                <>
                    <div className="mb-8 grid gap-5 md:grid-cols-2">

                        <div className="rounded-xl bg-white p-5 shadow">
                            <p className="text-gray-500">
                                Pending Authorities
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-blue-600">
                                {pendingAuthorities.length}
                            </h2>
                        </div>

                        <div className="rounded-xl bg-white p-5 shadow">
                            <p className="text-gray-500">
                                Pending Institutions
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-purple-600">
                                {institutions.length}
                            </h2>
                        </div>

                    </div>

                    {/* Authority approvals */}
                    <div className="mb-8 rounded-xl bg-white p-5 shadow">

                        <h2 className="mb-4 text-xl font-bold text-gray-800">
                            Institution Authority Requests
                        </h2>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[700px] text-left">
                                <thead className="bg-gray-200">
                                    <tr>
                                        <th className="p-3">ID</th>
                                        <th className="p-3">Username</th>
                                        <th className="p-3">Email</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3">Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {pendingAuthorities.length > 0 ? (
                                        pendingAuthorities.map((item) => (
                                            <tr key={item.id} className="border-b">
                                                <td className="p-3">{item.id}</td>
                                                <td className="p-3">{item.username || "-"}</td>
                                                <td className="p-3">{item.email || "-"}</td>
                                                <td className="p-3">
                                                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-700">
                                                        {item.approval_status || "pending"}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => reviewAuthority(item.id, "approve")}
                                                            className="rounded bg-green-600 px-3 py-2 text-sm text-white"
                                                        >
                                                            Approve
                                                        </button>

                                                        <button
                                                            onClick={() => reviewAuthority(item.id, "reject")}
                                                            className="rounded bg-red-600 px-3 py-2 text-sm text-white"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="p-5 text-center text-gray-500">
                                                No pending authority requests.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Institution approvals */}
                    <div className="rounded-xl bg-white p-5 shadow">

                        <h2 className="mb-4 text-xl font-bold text-gray-800">
                            Institution Requests
                        </h2>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[850px] text-left">
                                <thead className="bg-gray-200">
                                    <tr>
                                        <th className="p-3">ID</th>
                                        <th className="p-3">Institution Name</th>
                                        <th className="p-3">Education Level</th>
                                        <th className="p-3">Location</th>
                                        <th className="p-3">Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {institutions.length > 0 ? (
                                        institutions.map((item) => (
                                            <tr key={item.id} className="border-b">
                                                <td className="p-3">{item.id}</td>
                                                <td className="p-3 font-medium">{item.name || "-"}</td>
                                                <td className="p-3">{item.education_level || "-"}</td>
                                                <td className="p-3">{item.location || "-"}</td>
                                                <td className="p-3">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => reviewInstitution(item.id, "approve")}
                                                            className="rounded bg-green-600 px-3 py-2 text-sm text-white"
                                                        >
                                                            Approve
                                                        </button>

                                                        <button
                                                            onClick={() => reviewInstitution(item.id, "reject")}
                                                            className="rounded bg-red-600 px-3 py-2 text-sm text-white"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="p-5 text-center text-gray-500">
                                                No pending institution requests.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default Approvals;
