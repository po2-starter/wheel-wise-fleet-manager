
import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const location = useLocation();

  // If not logged in, redirect to login page
  if (!isLoggedIn && location.pathname !== "/login") {
    return <Navigate to="/login" />;
  }

  // If logged in and trying to access login page, redirect to dashboard
  if (isLoggedIn && location.pathname === "/login") {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export default AuthGuard;
