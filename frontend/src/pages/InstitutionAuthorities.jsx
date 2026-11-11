
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function InstitutionAuthorities() {
    const navigate = useNavigate();

    const API_URL = "http://127.0.0.1:8000/api";

    const [authorities, setAuthorities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const getToken = () =>
        localStorage.getItem("access_token") ||
        localStorage.getItem("access");

    // Fetch institution authorities
    const fetchAuthorities = async () => {
        setLoading(true);
        setError("");
        setMessage("");

        const token = getToken();

        if (!token) {
            setError("Login session not found. Please log in again.");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(
                `${API_URL}/users/authority-requests/`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = response.data;

            setAuthorities(
                Array.isArray(data)
                    ? data
                    : Array.isArray(data.results)
                        ? data.results
                        : []
            );
        } catch (err) {
            console.error(
                "Authority API error:",
                err.response?.data || err.message
            );

            setError(
                err.response?.data?.detail ||
                err.response?.data?.error ||
                "Unable to load institution authorities. Check your Django API."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuthorities();
    }, []);

    // Approve or reject authority
    const reviewAuthority = async (authorityId, action) => {
        const actionText = action === "approve" ? "approve" : "reject";

        if (!window.confirm(`Are you sure you want to ${actionText} this authority?`)) {
            return;
        }

        const token = getToken();

        if (!token) {
            setError("Login session not found. Please log in again.");
            return;
        }

        try {
            await axios.post(
                `${API_URL}/users/authority-requests/${authorityId}/${action}/`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setMessage(
                action === "approve"
                    ? "Authority approved successfully."
                    : "Authority rejected successfully."
            );

            fetchAuthorities();
        } catch (err) {
            console.error(
                "Authority review error:",
                err.response?.data || err.message
            );

            setError(
                err.response?.data?.detail ||
                err.response?.data?.error ||
                `Unable to ${actionText} authority.`
            );
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6 md:p-8">

            {/* Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">

                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        Institution Authorities
                    </h1>

                    <p className="mt-2 text-gray-600">
                        View and manage registered institution authorities.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={fetchAuthorities}
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

            {/* Messages */}
            {message && (
                <div className="mb-5 rounded-lg bg-green-50 p-4 text-green-700">
                    {message}
                </div>
            )}

            {error && (
                <div className="mb-5 rounded-lg bg-red-50 p-4 text-red-700">
                    {error}
                </div>
            )}

            {/* Total authorities */}
            <div className="mb-6 rounded-xl bg-white p-5 shadow">
                <p className="text-sm text-gray-500">
                    Total Authority Requests
                </p>

                <h2 className="mt-2 text-3xl font-bold text-blue-600">
                    {authorities.length}
                </h2>
            </div>

            {/* Authorities table */}
            {loading ? (
                <div className="rounded-xl bg-white p-8 text-center shadow">
                    Loading authorities...
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl bg-white shadow">

                    <table className="w-full min-w-[850px] text-left">

                        <thead className="bg-gray-200">
                            <tr>
                                <th className="p-4">ID</th>
                                <th className="p-4">Username</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {authorities.length > 0 ? (
                                authorities.map((authority) => (
                                    <tr
                                        key={authority.id}
                                        className="border-b hover:bg-gray-50"
                                    >
                                        <td className="p-4">
                                            {authority.id}
                                        </td>

                                        <td className="p-4 font-medium">
                                            {authority.username || "-"}
                                        </td>

                                        <td className="p-4">
                                            {authority.email || "-"}
                                        </td>

                                        <td className="p-4">
                                            <span className={`rounded-full px-3 py-1 text-sm ${
                                                authority.approval_status === "approved"
                                                    ? "bg-green-100 text-green-700"
                                                    : authority.approval_status === "rejected"
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-yellow-100 text-yellow-700"
                                            }`}>
                                                {authority.approval_status || "pending"}
                                            </span>
                                        </td>

                                        <td className="p-4">
                                            <div className="flex gap-2">

                                                {authority.approval_status !== "approved" && (
                                                    <button
                                                        onClick={() =>
                                                            reviewAuthority(authority.id, "approve")
                                                        }
                                                        className="rounded-md bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
                                                    >
                                                        Approve
                                                    </button>
                                                )}

                                                {authority.approval_status !== "rejected" && (
                                                    <button
                                                        onClick={() =>
                                                            reviewAuthority(authority.id, "reject")
                                                        }
                                                        className="rounded-md bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
                                                    >
                                                        Reject
                                                    </button>
                                                )}

                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="p-8 text-center text-gray-500"
                                    >
                                        No institution authorities found.
                                    </td>
                                </tr>
                            )}
                        </tbody>

                    </table>
                </div>
            )}
        </div>
    );
}

export default InstitutionAuthorities;
