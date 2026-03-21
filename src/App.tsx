import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/i18n/context";
import { AuthProvider } from "@/hooks/use-auth";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";

// Lazy load non-landing pages
const AgentsPage = lazy(() => import("./pages/AgentsPage"));
const AgentDetailPage = lazy(() => import("./pages/AgentDetailPage"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const TagPage = lazy(() => import("./pages/TagPage"));
const ComparePage = lazy(() => import("./pages/ComparePage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const SubmitPage = lazy(() => import("./pages/SubmitPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminAgentsList = lazy(() => import("./pages/admin/AdminAgentsList"));
const AdminCreateAgent = lazy(() => import("./pages/admin/AdminCreateAgent"));
const AdminEditAgent = lazy(() => import("./pages/admin/AdminEditAgent"));
const AdminOps = lazy(() => import("./pages/admin/AdminOps"));
const AdminSources = lazy(() => import("./pages/admin/AdminSources"));
const AdminCandidates = lazy(() => import("./pages/admin/AdminCandidates"));
const AdminReview = lazy(() => import("./pages/admin/AdminReview"));
const AdminAnnouncements = lazy(() => import("./pages/admin/AdminAnnouncements"));
const AdminQuality = lazy(() => import("./pages/admin/AdminQuality"));
const AdminSuggestions = lazy(() => import("./pages/admin/AdminSuggestions"));
const AdminGitHubSync = lazy(() => import("./pages/admin/AdminGitHubSync"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="flex flex-col min-h-screen">
              <AnnouncementBanner />
              <Header />
              <main className="flex-1">
                <Suspense fallback={null}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/agents" element={<AgentsPage />} />
                    <Route path="/agents/:slug" element={<AgentDetailPage />} />
                    <Route path="/categories/:slug" element={<CategoryPage />} />
                    <Route path="/tags/:slug" element={<TagPage />} />
                    <Route path="/compare" element={<ComparePage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/submit" element={<SubmitPage />} />
                    <Route path="/admin/agents" element={<AdminAgentsList />} />
                    <Route path="/admin/agents/new" element={<AdminCreateAgent />} />
                    <Route path="/admin/agents/:id/edit" element={<AdminEditAgent />} />
                    <Route path="/admin/ops" element={<AdminOps />} />
                    <Route path="/admin/sources" element={<AdminSources />} />
                    <Route path="/admin/candidates" element={<AdminCandidates />} />
                    <Route path="/admin/review/:id" element={<AdminReview />} />
                    <Route path="/admin/announcements" element={<AdminAnnouncements />} />
                    <Route path="/admin/quality" element={<AdminQuality />} />
                    <Route path="/admin/suggestions" element={<AdminSuggestions />} />
                    <Route path="/admin/github-sync" element={<AdminGitHubSync />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </I18nProvider>
  </QueryClientProvider>
);

export default App;
