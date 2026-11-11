
import React from "react";
import { Routes, Route, Link } from "react-router-dom";

// Authentication pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgetPassword";

// Dashboards
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import AuthorityDashboard from "./pages/AuthorityDashboard";

// Institution pages
import AddInstitution from "./pages/AddInstitution";
import Institutions from "./pages/Institutions";
import InstitutionDetails from "./pages/InstitutionDetails";
import EditInstitution from "./pages/EditInstitution";
import SearchResults from "./pages/SearchResults";

// Education-level pages
import SchoolList from "./pages/SchoolList";
import Juniorcollegelist from "./pages/Juniorcollegelist";
import Engineeringcollegelist from "./pages/Engineeringcollegelist";
import Degreecollegelist from "./pages/Degreecollegelist";
import Diplomalist from "./pages/Diplomalist";

// Student pages
import Compare from "./pages/Compare";
import AIAdvisor from "./pages/AIAdvisor";
import Saved from "./pages/Saved";
import Map from "./pages/Map";

// Additional student features
import CostCalculator from "./pages/CostCalculator";
import CutoffTrends from "./pages/CutoffTrends";

// Admin management pages
import Users from "./pages/Users";
import ManageInstitutions from "./pages/ManageInstitutions";
import InstitutionAuthorities from "./pages/InstitutionAuthorities";
import Approvals from "./pages/Approvals";

// Protected routes
import ProtectedRoute from "./pages/ProtectedRoute";
import AuthorityApprovalStatus from "./pages/AuthorityApprovalStatus";


function App() {
  return (
    <Routes>

      {/* =================================
          AUTHENTICATION ROUTES
      ================================= */}

      <Route path="/" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />


      {/* =================================
          STUDENT ROUTES
      ================================= */}

      <Route
        path="/home"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/search"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <SearchResults />
          </ProtectedRoute>
        }
      />

      <Route
        path="/map"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <Map />
          </ProtectedRoute>
        }
      />

      <Route
        path="/institutions"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <Institutions />
          </ProtectedRoute>
        }
      />

      <Route
        path="/institution/:id"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <InstitutionDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/institutions/:id"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <InstitutionDetails />
          </ProtectedRoute>
        }
      />

      {/* Education-level pages */}

      <Route
        path="/schools"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <SchoolList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/junior-colleges"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <Juniorcollegelist />
          </ProtectedRoute>
        }
      />

      <Route
        path="/engineering-colleges"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <Engineeringcollegelist />
          </ProtectedRoute>
        }
      />

      <Route
        path="/degree"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <Degreecollegelist />
          </ProtectedRoute>
        }
      />

      <Route
        path="/diploma"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <Diplomalist />
          </ProtectedRoute>
        }
      />

      {/* Student features */}

      <Route
        path="/compare"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <Compare />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ai-advisor"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <AIAdvisor />
          </ProtectedRoute>
        }
      />

      <Route
        path="/saved"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <Saved />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cost-calculator"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <CostCalculator />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cutoff-trends"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <CutoffTrends />
          </ProtectedRoute>
        }
      />


      {/* =================================
          ADMIN ROUTES
      ================================= */}

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Users />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/authorities"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <InstitutionAuthorities />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/institutions"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <ManageInstitutions />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/institutions/:id"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <InstitutionDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/institutions/:id/edit"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <EditInstitution />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/approvals"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Approvals />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/add-institution"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AddInstitution />
          </ProtectedRoute>
        }
      />


      {/* =================================
          INSTITUTION AUTHORITY ROUTES
      ================================= */}

      <Route
        path="/authority"
        element={
          <ProtectedRoute allowedRoles={["authority"]}>
            <AuthorityDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/add-institution"
        element={
          <ProtectedRoute allowedRoles={["authority"]}>
            <AddInstitution />
          </ProtectedRoute>
        }
      />

      <Route
        path="/institution"
        element={
          <ProtectedRoute allowedRoles={["authority"]}>
            <AuthorityDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/authority/approval-status"
        element={
          <ProtectedRoute allowedRoles={["authority"]}>
            <AuthorityApprovalStatus />
          </ProtectedRoute>
        }
      />

      {/* Authority: My Institutions */}

      <Route
        path="/authority/institutions"
        element={
          <ProtectedRoute allowedRoles={["authority"]}>
            <ManageInstitutions />
          </ProtectedRoute>
        }
      />

      {/* Authority: View Institution */}

      <Route
        path="/authority/institutions/:id"
        element={
          <ProtectedRoute allowedRoles={["authority"]}>
            <InstitutionDetails />
          </ProtectedRoute>
        }
      />

      {/* Authority: Edit Own Institution */}

      <Route
        path="/authority/institutions/:id/edit"
        element={
          <ProtectedRoute allowedRoles={["authority"]}>
            <EditInstitution />
          </ProtectedRoute>
        }
      />


      {/* =================================
          404 - PAGE NOT FOUND
      ================================= */}

      <Route
        path="*"
        element={
          <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">

              <h1 className="text-4xl font-bold text-red-600">
                404
              </h1>

              <h2 className="mt-2 text-xl font-semibold text-gray-800">
                Page Not Found
              </h2>

              <p className="mt-3 text-gray-600">
                Sorry! The page you are looking for does not exist.
              </p>

              <Link
                to="/"
                className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Back to Login
              </Link>

            </div>
          </div>
        }
      />

    </Routes>
  );
}

export default App;
