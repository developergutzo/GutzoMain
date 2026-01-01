import React, { useEffect } from 'react';
import { Toaster } from "sonner";
import { PartnerLoginPage } from "./pages/PartnerLoginPage";
import { PartnerDashboard } from "./pages/PartnerDashboard";
import { PartnerPage } from "./pages/PartnerPage";
import { RouterProvider, useRouter } from "./components/Router";

function AppContent() {
  // We use `window.location.pathname` directly for simple routing logic
  // but since we have a RouterProvider, we should use its state for consistency if possible,
  // or just rely on the path since RouterProvider syncs with it.
  
  const { currentRoute, navigate } = useRouter();

  useEffect(() => {
    // If we are at root '/', redirect to '/partner/login' OR '/partner/dashboard' based on auth?
    // User requested: "show the dashboard of vendor if not logged in then show the vendor login in localhost:3001 directly."
    // Actually, normally one redirects TO login. 
    // If the path is exactly '/', let's simply RENDER the Dashboard component. 
    // The Dashboard component itself has a `useEffect` that checks auth and redirects to login if needed.
    // See PartnerDashboard.tsx:
    // useEffect(() => {
    //   if (!stored) navigate('/partner/login');
    // }, ...)
    
    // So, if we map '/' to PartnerDashboard, it will auto-redirect to '/partner/login' if not auth.
    // But we want to keep the URL clean if possible, or support the redirect.
    // Let's support mapping '/' directly to PartnerDashboard.
    
  }, []);

  const path = window.location.pathname;

  // Exact match for root -> Check Auth
  if (path === '/') {
    const stored = localStorage.getItem('vendor_data');
    if (stored) return <PartnerDashboard />;
    return <PartnerLoginPage />;
  }

  // Dashboard path -> Dashboard
  if (path === '/dashboard' || path === '/partner/dashboard') {
     return <PartnerDashboard />;
  }

  // Login path -> Login
  if (path === '/login' || path === '/partner/login') {
     return <PartnerLoginPage />;
  }

  if (path === '/partner-with-gutzo') {
     return <PartnerPage />;
  }

  // Fallback
  return <PartnerLoginPage />;
}

export default function App() {
  return (
      <RouterProvider>
        <AppContent />
        <Toaster position="top-center" />
      </RouterProvider>
  );
}