
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
    const navigate = useNavigate();

    const username = localStorage.getItem("username") || "Admin";
    const role = localStorage.getItem("role");

    const handleLogout = () => {
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        localStorage.removeItem("access");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("edulocate_logged_in");

        navigate("/", { replace: true });
    };

    // Check admin access
    if (role !== "admin") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
                <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
                    <h2 className="mb-3 text-2xl font-bold text-red-600">
                        Access Denied
                    </h2>

                    <p className="mb-5 text-gray-600">
                        Please log in with an admin account to access this page.
                    </p>

                    <button
                        onClick={() => navigate("/", { replace: true })}
                        className="rounded-lg bg-blue-600 px-5 py-2 text-white transition hover:bg-blue-700"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    // Dashboard cards and their routes
    const dashboardCards = [
        {
            title: "Users",
            description: "View and manage registered student accounts.",
            icon: "👥",
            route: "/admin/users",
        },
        {
            title: "Institution Authorities",
            description: "Manage authority accounts and registration requests.",
            icon: "🛡️",
            route: "/admin/authorities",
        },
        {
            title: "Institutions",
            description: "View, update and manage all institutions.",
            icon: "🏫",
            route: "/admin/institutions",
        },
        {
            title: "Approvals",
            description: "Approve or reject authority and institution requests.",
            icon: "📋",
            route: "/admin/approvals",
        },
    ];

    return (
        <div className="min-h-screen bg-gray-100">

            {/* Navbar */}
            <nav className="flex flex-wrap items-center justify-between gap-4 bg-blue-700 px-6 py-4 text-white shadow-lg">

                <h1 className="text-2xl font-bold">
                    EduLocate Admin
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

            {/* Main Content */}
            <main className="mx-auto max-w-7xl p-6 md:p-8">

                <h2 className="mb-2 text-3xl font-bold text-gray-800">
                    Admin Dashboard
                </h2>

                <p className="mb-8 text-gray-600">
                    Manage users, authorities, institutions and approval requests.
                </p>

                {/* Dashboard Cards */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

                    {dashboardCards.map((card) => (
                        <button
                            key={card.route}
                            type="button"
                            onClick={() => navigate(card.route)}
                            className="rounded-xl bg-white p-6 text-left shadow transition duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <span className="mb-4 block text-4xl">
                                {card.icon}
                            </span>

                            <h3 className="mb-2 text-xl font-semibold text-gray-800">
                                {card.title}
                            </h3>

                            <p className="text-sm leading-6 text-gray-600">
                                {card.description}
                            </p>

                            <span className="mt-5 inline-block font-semibold text-blue-600">
                                Manage →
                            </span>
                        </button>
                    ))}

                </div>

                {/* Add Institution */}
                <div className="mt-8 rounded-xl bg-white p-6 shadow">

                    <div className="flex flex-wrap items-center justify-between gap-4">

                        <div>
                            <h3 className="mb-2 text-xl font-semibold text-gray-800">
                                Add Institution
                            </h3>

                            <p className="text-gray-600">
                                Add a new school, inter college, diploma college,
                                engineering college or degree college.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate("/admin/add-institution")}
                            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
                        >
                            + Add Institution
                        </button>

                    </div>
                </div>

            </main>
        </div>
    );
}

export default AdminDashboard;
