import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { MainLayout } from "@/components/layout/MainLayout";
import Index from "./pages/Index";
import DocumentCapture from "./pages/DocumentCapture";
import Approval from "./pages/Approval";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import RequireAuth from "@/components/RequireAuth";
import FinanceApprovals from "./pages/FinanceApprovals";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="xdms-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/"
              element={
                <RequireAuth>
                  <MainLayout>
                    <Index />
                  </MainLayout>
                </RequireAuth>
              }
            />

            <Route
              path="/document-capture"
              element={
                <RequireAuth>
                  <MainLayout>
                    <DocumentCapture />
                  </MainLayout>
                </RequireAuth>
              }
            />

            <Route
              path="/approval"
              element={
                <RequireAuth>
                  <MainLayout>
                    <Approval />
                  </MainLayout>
                </RequireAuth>
              }
            />

            <Route
              path="/finance-approvals"
              element={
                <RequireAuth>
                  <MainLayout>
                    <FinanceApprovals />
                  </MainLayout>
                </RequireAuth>
              }
            />

            <Route
              path="/settings"
              element={
                <RequireAuth>
                  <MainLayout>
                    <Settings />
                  </MainLayout>
                </RequireAuth>
              }
            />

            <Route
              path="*"
              element={
                <RequireAuth>
                  <MainLayout>
                    <NotFound />
                  </MainLayout>
                </RequireAuth>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
