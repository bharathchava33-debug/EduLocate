
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const username = localStorage.getItem("username") || "User";

  // Read and normalize the role saved during login
  const role = (
    localStorage.getItem("role") ||
    localStorage.getItem("user_role") ||
    ""
  )
    .trim()
    .toLowerCase();

  const normalizedRole =
    role === "authority" || role === "college" || role === "institution_owner"
      ? "institution"
      : role;

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("user_role");
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("edulocate_logged_in");

    navigate("/");
  };

  const roles = {
    student: {
      title: "Student Dashboard",
      description: "Search, filter, and compare educational institutions.",
      button: "Find Institutions",
      path: "/search",
      style: "bg-blue-50 border-blue-200",
      buttonStyle: "bg-blue-600 hover:bg-blue-700",
    },
    admin: {
      title: "Admin Dashboard",
      description: "Manage and maintain all institution information.",
      button: "Manage Institutions",
      path: "/add-institution",
      style: "bg-purple-50 border-purple-200",
      buttonStyle: "bg-purple-600 hover:bg-purple-700",
    },
    institution: {
      title: "Institution Dashboard",
      description: "Add and manage your institution's information.",
      button: "Manage My Institution",
      path: "/institution/add-institution",
      style: "bg-green-50 border-green-200",
      buttonStyle: "bg-green-600 hover:bg-green-700",
    },
  };

  const dashboard = roles[normalizedRole];

  return (
    <div className="min-h-screen bg-gray-100 p-6 sm:p-10">
      <div className="mx-auto max-w-5xl rounded-2xl bg-white p-6 shadow-lg sm:p-10">
        <h1 className="text-3xl font-bold text-blue-700">
          Welcome to EduLocate
        </h1>

        <p className="mt-3 text-gray-600">
          Hello, {username}!
        </p>

        {dashboard ? (
          <div
            className={`mt-8 rounded-xl border p-6 transition duration-300 hover:shadow-md ${dashboard.style}`}
          >
            <h2 className="text-2xl font-semibold text-gray-800">
              {dashboard.title}
            </h2>

            <p className="mt-3 text-gray-700">
              {dashboard.description}
            </p>

            <p className="mt-3 text-sm text-gray-500">
              Logged-in role: {normalizedRole}
            </p>

            <button
              onClick={() => navigate(dashboard.path)}
              className={`mt-5 rounded-lg px-5 py-3 font-medium text-white transition duration-300 ${dashboard.buttonStyle}`}
            >
              {dashboard.button}
            </button>
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-6">
            <h2 className="text-xl font-semibold text-red-700">
              Role not detected
            </h2>

            <p className="mt-2 text-gray-700">
              Your login response may not be saving your role correctly.
            </p>

            <p className="mt-2 text-sm text-gray-600">
              Current saved role: {role || "No role found"}
            </p>

            <button
              onClick={() => navigate("/")}
              className="mt-5 rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
            >
              Go to Login
            </button>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="mt-8 rounded-lg bg-red-600 px-5 py-3 text-white transition hover:bg-red-700"
        >
          Logout
        </button>
      </div>
      


   

</div>

  
  );
}

export default Home;
