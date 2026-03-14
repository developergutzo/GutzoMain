import React from 'react';
import { Toaster } from "sonner";
import { PartnerLoginPage } from "./pages/PartnerLoginPage";
import { PartnerDashboard } from "./pages/PartnerDashboard";
import { PartnerPage } from "./pages/PartnerPage";
import { RouterProvider, useRouter } from "./components/Router";

function AppContent() {
  const { currentRoute } = useRouter();

  // Exact match for root -> Check Auth
  if (currentRoute === '/') {
    const stored = localStorage.getItem('vendor_data');
    if (stored) return <PartnerDashboard />;
    return <PartnerLoginPage />;
  }

  // Dashboard path -> Dashboard
  if (currentRoute === '/dashboard' || currentRoute === '/partner/dashboard') {
     return <PartnerDashboard />;
  }

  // Login path -> Login
  if (currentRoute === '/login' || currentRoute === '/partner/login') {
     return <PartnerLoginPage />;
  }

  if (currentRoute === '/partner-with-gutzo') {
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