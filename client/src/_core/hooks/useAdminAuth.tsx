import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "wouter";

interface ProtectedAdminRouteProps {
  children: ReactNode;
}

/**
 * ProtectedAdminRoute - Wraps admin pages to ensure only authenticated admins can access them
 * Checks for valid admin session in localStorage and redirects to login if not authenticated
 */
export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check for admin session in localStorage
    const adminSession = localStorage.getItem("adminSession");

    if (!adminSession) {
      // No session found, redirect to login
      setLocation("/solupedia-admin");
      setIsAuthenticated(false);
      return;
    }

    try {
      // Verify the session data is valid JSON
      const sessionData = JSON.parse(adminSession);

      // Basic validation - session should have required fields
      if (!sessionData.id || !sessionData.email || !sessionData.loginTime) {
        // Invalid session structure, clear and redirect
        localStorage.removeItem("adminSession");
        setLocation("/solupedia-admin");
        setIsAuthenticated(false);
        return;
      }

      // Check if session is not too old (optional: 24-hour expiry)
      const loginTime = new Date(sessionData.loginTime);
      const now = new Date();
      const hoursSinceLogin =
        (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLogin > 24) {
        // Session expired, clear and redirect
        localStorage.removeItem("adminSession");
        setLocation("/solupedia-admin");
        setIsAuthenticated(false);
        return;
      }

      // Session is valid
      setIsAuthenticated(true);
    } catch {
      // Invalid JSON, clear and redirect
      localStorage.removeItem("adminSession");
      setLocation("/solupedia-admin");
      setIsAuthenticated(false);
    }
  }, [setLocation]);

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, the useEffect will handle the redirect
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Render the protected content
  return <>{children}</>;
}

/**
 * Hook to check if user is authenticated as admin
 * Can be used within admin pages for additional checks
 */
export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const adminSession = localStorage.getItem("adminSession");

    if (!adminSession) {
      setLocation("/solupedia-admin");
      setIsAuthenticated(false);
      return;
    }

    try {
      const sessionData = JSON.parse(adminSession);

      if (!sessionData.id || !sessionData.email || !sessionData.loginTime) {
        localStorage.removeItem("adminSession");
        setLocation("/solupedia-admin");
        setIsAuthenticated(false);
        return;
      }

      const loginTime = new Date(sessionData.loginTime);
      const now = new Date();
      const hoursSinceLogin =
        (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLogin > 24) {
        localStorage.removeItem("adminSession");
        setLocation("/solupedia-admin");
        setIsAuthenticated(false);
        return;
      }

      setIsAuthenticated(true);
    } catch {
      localStorage.removeItem("adminSession");
      setLocation("/solupedia-admin");
      setIsAuthenticated(false);
    }
  }, [setLocation]);

  return {
    isAuthenticated,
    loading: isAuthenticated === null,
  };
}
