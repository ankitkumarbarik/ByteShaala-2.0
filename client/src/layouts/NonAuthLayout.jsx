import { Outlet, useLocation } from "react-router-dom";

import Navbar from "@/components/common/navbar";

function NonAuthLayout() {
  const location = useLocation();

  // Check if current route is an auth form that needs centering
  const isAuthForm =
    ["/login", "/register", "/verify-otp", "/forgot-password"].includes(
      location.pathname
    ) || location.pathname.startsWith("/reset-password");

  return (
    <>
      <Navbar isAuthenticated={false} />

      <main
        className={
          isAuthForm
            ? "flex items-center justify-center min-h-screen py-8 px-4"
            : ""
        }
      >
        {isAuthForm ? (
          // Centered layout for auth forms (login, signup, etc.)
          <div className="w-full max-w-md rounded-lg shadow-lg">
            <Outlet />
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>2024 LMS Platform. All rights reserved.</p>
            </div>
          </div>
        ) : (
          // Full width layout for courses and other public pages
          <Outlet />
        )}
      </main>
    </>
  );
}

export default NonAuthLayout;
