
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

function ManageInstitutions() {
    const navigate = useNavigate();

    const [institutions, setInstitutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const role = localStorage.getItem("role")?.toLowerCase();
    const isAdmin = role === "admin";
    const isAuthority = role === "authority";

    const getToken = () =>
        localStorage.getItem("access_token") ||
        localStorage.getItem("access");

    const getHeaders = () => ({
        Authorization: `Bearer ${getToken()}`,
    });

    const fetchInstitutions = useCallback(async () => {
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
                `${API_URL}/institutions/`,
                { headers: getHeaders() }
            );

            const data = response.data;

            setInstitutions(
                Array.isArray(data)
                    ? data
                    : Array.isArray(data.results)
                        ? data.results
                        : []
            );
        } catch (err) {
            console.error(
                "Institution API error:",
                err.response?.data || err.message
            );

            setError(
                err.response?.data?.detail ||
                err.response?.data?.error ||
                "Unable to load institutions."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInstitutions();
    }, [fetchInstitutions]);

    const getDetailsPath = (id) => {
        return isAdmin
            ? `/admin/institutions/${id}`
            : `/authority/institutions/${id}`;
    };

    const getEditPath = (id) => {
        return isAdmin
            ? `/admin/institutions/${id}/edit`
            : `/authority/institutions/${id}/edit`;
    };

    const handleAddInstitution = () => {
        navigate(
            isAdmin
                ? "/admin/add-institution"
                : "/add-institution"
        );
    };

    const handleBack = () => {
        navigate(isAdmin ? "/admin" : "/authority");
    };

    const deleteInstitution = async (id, name) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${name}"? This action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            await axios.delete(
                `${API_URL}/institutions/${id}/`,
                { headers: getHeaders() }
            );

            setInstitutions((previous) =>
                previous.filter(
                    (institution) => institution.id !== id
                )
            );

            setMessage("Institution deleted successfully.");
            setError("");
        } catch (err) {
            console.error(
                "Delete institution error:",
                err.response?.data || err.message
            );

            setError(
                err.response?.data?.detail ||
                err.response?.data?.error ||
                "Unable to delete institution. Check your permissions."
            );
        }
    };

    if (!isAdmin && !isAuthority) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
                <div className="rounded-xl bg-white p-8 text-center shadow">
                    <h2 className="text-xl font-bold text-red-600">
                        Access Denied
                    </h2>
                    <p className="mt-2 text-gray-600">
                        You are not authorized to manage institutions.
                    </p>
                    <button
                        onClick={() => navigate("/")}
                        className="mt-5 rounded-lg bg-blue-600 px-5 py-2 text-white"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6 md:p-8">

            {/* HEADER */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        {isAdmin
                            ? "Manage All Institutions"
                            : "My Institutions"}
                    </h1>

                    <p className="mt-2 text-gray-600">
                        {isAdmin
                            ? "View, edit and delete all registered institutions."
                            : "View, edit and delete institutions submitted by you."}
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={fetchInstitutions}
                        disabled={loading}
                        className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "Loading..." : "Refresh"}
                    </button>

                    <button
                        onClick={handleAddInstitution}
                        className="rounded-lg bg-green-600 px-5 py-2 text-white hover:bg-green-700"
                    >
                        + Add Institution
                    </button>

                    <button
                        onClick={handleBack}
                        className="rounded-lg bg-gray-700 px-5 py-2 text-white hover:bg-gray-800"
                    >
                        Back
                    </button>
                </div>
            </div>

            {/* MESSAGES */}
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

            {/* TOTAL */}
            <div className="mb-6 rounded-xl bg-white p-5 shadow">
                <p className="text-sm text-gray-500">
                    {isAdmin
                        ? "Total Institutions"
                        : "My Total Institutions"}
                </p>

                <h2 className="mt-2 text-3xl font-bold text-blue-600">
                    {institutions.length}
                </h2>
            </div>

            {/* TABLE */}
            {loading ? (
                <div className="rounded-xl bg-white p-8 text-center shadow">
                    Loading institutions...
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl bg-white shadow">
                    <table className="w-full min-w-[1100px] text-left">

                        <thead className="bg-gray-200">
                            <tr>
                                <th className="p-4">ID</th>
                                <th className="p-4">Institution Name</th>
                                <th className="p-4">Education Level</th>
                                <th className="p-4">Location</th>
                                <th className="p-4">Rating</th>
                                <th className="p-4">Phone</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {institutions.length > 0 ? (
                                institutions.map((institution) => (
                                    <tr
                                        key={institution.id}
                                        className="border-b hover:bg-gray-50"
                                    >
                                        <td className="p-4">
                                            {institution.id}
                                        </td>

                                        <td className="p-4 font-semibold">
                                            {institution.name || "-"}
                                        </td>

                                        <td className="p-4 capitalize">
                                            {institution.education_level
                                                ?.replaceAll("_", " ") || "-"}
                                        </td>

                                        <td className="p-4">
                                            {institution.location || "-"}
                                        </td>

                                        <td className="p-4">
                                            {institution.rating ?? "-"}
                                        </td>

                                        <td className="p-4">
                                            {institution.phone || "-"}
                                        </td>

                                        <td className="p-4">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                    institution.approval_status === "approved"
                                                        ? "bg-green-100 text-green-700"
                                                        : institution.approval_status === "rejected"
                                                            ? "bg-red-100 text-red-700"
                                                            : "bg-yellow-100 text-yellow-700"
                                                }`}
                                            >
                                                {institution.approval_status || "Unknown"}
                                            </span>
                                        </td>

                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() =>
                                                        navigate(
                                                            getDetailsPath(institution.id)
                                                        )
                                                    }
                                                    className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                                                >
                                                    View
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        navigate(
                                                            getEditPath(institution.id)
                                                        )
                                                    }
                                                    className="rounded-md bg-yellow-500 px-3 py-2 text-sm text-white hover:bg-yellow-600"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        deleteInstitution(
                                                            institution.id,
                                                            institution.name
                                                        )
                                                    }
                                                    className="rounded-md bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="8"
                                        className="p-8 text-center text-gray-500"
                                    >
                                        No institutions found.
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

export default ManageInstitutions;
