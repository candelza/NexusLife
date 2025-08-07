import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import NewPrayer from "./pages/NewPrayer";
import Calendar from "./pages/Calendar";
import MemberManagement from "./pages/MemberManagement";
import PrayerDetail from "./pages/PrayerDetail";
import AdminSettings from "./pages/AdminSettings";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import EditProfile from "./pages/EditProfile";
import NotFound from "./pages/NotFound";

import Debug from "./debug";

import { ErrorBoundary } from "react-error-boundary";

const queryClient = new QueryClient();

// Error Fallback Component
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => {
  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
      <div className="text-center p-8">
        <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl">⚠️</span>
        </div>
        <h1 className="text-2xl font-bold mb-4">เกิดข้อผิดพลาด</h1>
        <p className="text-muted-foreground mb-4">ขออภัย เกิดข้อผิดพลาดที่ไม่คาดคิด</p>
        <div className="bg-red-50 p-4 rounded-lg mb-4 text-left">
          <p className="text-sm text-red-700">{error.message}</p>
        </div>
        <button
          onClick={resetErrorBoundary}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          ลองใหม่
        </button>
      </div>
    </div>
  );
};

const App = () => (
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/debug" element={<Debug />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/edit" element={<EditProfile />} />
              <Route path="/new-prayer" element={<NewPrayer />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/groups" element={<MemberManagement />} />
              <Route path="/prayer/:id" element={<PrayerDetail />} />
              <Route path="/admin" element={<AdminSettings />} />
      
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
