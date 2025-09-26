import { Outlet } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SuperAdminProvider } from "@/contexts/SuperAdminContext";
import { Toaster } from "@/components/ui/toaster";

const RootLayout = () => {
  return (
    <AuthProvider>
      <SuperAdminProvider>
        <div className="min-h-screen">
          <Outlet />
          <Toaster />
        </div>
      </SuperAdminProvider>
    </AuthProvider>
  );
};

export default RootLayout;