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
import Index from "./pages/Index";
import AgentsPage from "./pages/AgentsPage";
import AgentDetailPage from "./pages/AgentDetailPage";
import CategoryPage from "./pages/CategoryPage";
import TagPage from "./pages/TagPage";
import ComparePage from "./pages/ComparePage";
import SearchPage from "./pages/SearchPage";
import SubmitPage from "./pages/SubmitPage";
import NotFound from "./pages/NotFound";
import AdminAgentsList from "./pages/admin/AdminAgentsList";
import AdminCreateAgent from "./pages/admin/AdminCreateAgent";
import AdminEditAgent from "./pages/admin/AdminEditAgent";
import AdminOps from "./pages/admin/AdminOps";
import AdminSources from "./pages/admin/AdminSources";
import AdminCandidates from "./pages/admin/AdminCandidates";
import AdminReview from "./pages/admin/AdminReview";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminQuality from "./pages/admin/AdminQuality";
import AdminSuggestions from "./pages/admin/AdminSuggestions";
import AdminGitHubSync from "./pages/admin/AdminGitHubSync";

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
                  <Route path="*" element={<NotFound />} />
                </Routes>
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
