import { Navigate, Outlet } from "react-router-dom";

const GuestRoute = () => {
  // Check if the JWT token exists
  const token = localStorage.getItem("token");

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default GuestRoute;