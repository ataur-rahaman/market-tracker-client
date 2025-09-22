import React from "react";
import { Navigate, useLocation } from "react-router";
import useAuth from "../../hooks/useAuth";
import useUserRole from "../../hooks/useUserRole";
import LoadingSpinner from "../../components/LoadingSpinner";
import ForbiddenPage from "../../pages/ForbiddenPage";

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { user, loading: authLoading } = useAuth();
  const { role, roleLoading } = useUserRole();
  const location = useLocation();

  if (authLoading || roleLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <ForbiddenPage></ForbiddenPage>;
  }

  return children;
};

export default RoleBasedRoute;