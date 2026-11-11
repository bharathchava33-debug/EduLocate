
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Users() {
    const navigate = useNavigate();

    const API_URL = "http://127.0.0.1:8000/api";

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchUsers = async () => {
        setLoading(true);
        setError("");

        const token =
            localStorage.getItem("access_token") ||
            localStorage.getItem("access");

        if (!token) {
            setError("Login session not found. Please log in again.");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(
                `${API_URL}/users/`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = response.data;

            setUsers(
                Array.isArray(data)
                    ? data
                    : Array.isArray(data.results)
                        ? data.results
                        : []
            );
        } catch (err) {
            console.error("Users API error:", err.response?.data || err.message);

            setError(
                err.response?.data?.detail ||
                err.response?.data?.error ||
                "Unable to load users. Please check your Django API."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-6 md:p-8">

            {/* Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">

                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        Manage Users
                    </h1>

                    <p className="mt-2 text-gray-600">
                        View all registered EduLocate users.
                    </p>
                </div>

                <div className="flex gap-3">

                    <button
                        onClick={fetchUsers}
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

            {/* Total users */}
            <div className="mb-6 rounded-xl bg-white p-5 shadow">
                <p className="text-sm text-gray-500">
                    Total Registered Users
                </p>

                <h2 className="mt-2 text-3xl font-bold text-blue-600">
                    {users.length}
                </h2>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                    {error}
                </div>
            )}

            {/* Loading */}
            {loading ? (
                <div className="rounded-xl bg-white p-8 text-center shadow">
                    Loading users...
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl bg-white shadow">

                    <table className="w-full min-w-[650px] text-left">

                        <thead className="bg-gray-200">
                            <tr>
                                <th className="p-4">ID</th>
                                <th className="p-4">Username</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {users.length > 0 ? (
                                users.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="border-b hover:bg-gray-50"
                                    >
                                        <td className="p-4">{user.id}</td>

                                        <td className="p-4 font-medium">
                                            {user.username || "-"}
                                        </td>

                                        <td className="p-4">
                                            {user.email || "-"}
                                        </td>

                                        <td className="p-4">
                                            {user.role || "-"}
                                        </td>

                                        <td className="p-4">
                                            <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                                                {user.approval_status || "Active"}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="p-8 text-center text-gray-500"
                                    >
                                        No registered users found.
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

export default Users;
