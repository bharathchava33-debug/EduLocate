
import { useNavigate } from "react-router-dom";

function AuthorityDashboard() {
    const navigate = useNavigate();

    const username = localStorage.getItem("username") || "Authority";

    const handleLogout = () => {
        [
            "username",
            "email",
            "name",
            "role",
            "access_token",
            "refresh_token",
            "access",
            "refresh",
            "edulocate_logged_in",
        ].forEach((key) => localStorage.removeItem(key));

        navigate("/", { replace: true });
    };

    return (
        <div className="min-h-screen bg-gray-100">

            <nav className="flex flex-wrap items-center justify-between gap-4 bg-green-700 px-6 py-4 text-white">
                <h1 className="text-2xl font-bold">
                    Institution Authority
                </h1>

                <div className="flex items-center gap-4">
                    <span className="font-medium">
                        Welcome, {username}
                    </span>

                    <button
                        onClick={handleLogout}
                        className="rounded-lg bg-red-500 px-4 py-2 transition hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <main className="p-6 md:p-8">
                <h2 className="mb-2 text-3xl font-bold">
                    Authority Dashboard
                </h2>

                <p className="mb-8 text-gray-600">
                    Manage your institution information through EduLocate.
                </p>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                    {/* ADD INSTITUTION */}
                    <div className="rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg">
                        <h3 className="mb-2 text-xl font-semibold">
                            Add Institution
                        </h3>

                        <p className="mb-4 text-gray-600">
                            Add institution details, courses, branches,
                            fees and location.
                        </p>

                        <button
                            onClick={() => navigate("/add-institution")}
                            className="rounded-lg bg-green-600 px-5 py-2 text-white transition hover:bg-green-700"
                        >
                            Add Institution
                        </button>
                    </div>

                    {/* MY INSTITUTION */}
                    <div className="rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg">
                        <h3 className="mb-2 text-xl font-semibold">
                            My Institution
                        </h3>

                        <p className="mb-4 text-gray-600">
                            View and update your institution information.
                        </p>

                        <button
                            onClick={() => navigate("/add-institution")}
                            className="rounded-lg bg-blue-600 px-5 py-2 text-white transition hover:bg-blue-700"
                        >
                            Add / Update Details
                        </button>
                    </div>

                    {/* APPROVAL STATUS */}
                    <div className="rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg">
                        <h3 className="mb-2 text-xl font-semibold">
                            Submission Status
                        </h3>

                        <p className="mb-4 text-gray-600">
                            Check whether your institution has been approved
                            by the EduLocate administrator.
                        </p>

                        <button
                            onClick={() =>
                                navigate("/authority/approval-status")
                            }
                            className="rounded-lg bg-orange-500 px-5 py-2 font-medium text-white transition hover:bg-orange-600"
                        >
                            Check Approval Status
                        </button>
                    </div>

                </div>
            </main>
        </div>
    );
}

export default AuthorityDashboard;
