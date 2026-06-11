import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  // Check if the JWT token exists in the browser's local storage
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;