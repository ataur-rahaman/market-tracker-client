import React from "react";
import { Link } from "react-router";
import useUserRole from "../hooks/useUserRole";

const ForbiddenPage = () => {
  const { role } = useUserRole();

  const dashboardLinks = {
    user: "/dashboard/user",
    vendor: "/dashboard/vendor",
    admin: "/dashboard/admin",
  };

  const userDashboard = dashboardLinks[role] || "/";

  return (
    <>
    <title>Forbidden</title>
    <div className="flex flex-col items-center justify-center h-screen text-center px-4">
      <h1 className="text-6xl font-bold text-red-600 mb-4">403</h1>
      <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
      <p className="text-gray-600 mb-6">
        Sorry, you don't have permission to access this page.
      </p>
      <div className="flex gap-4">
        <Link to="/" className="btn btn-outline">
          Back to Home
        </Link>
        <Link to={userDashboard} className="btn btn-primary">
          Go to Your Dashboard
        </Link>
      </div>
    </div>
    </>
  );
};

export default ForbiddenPage;
