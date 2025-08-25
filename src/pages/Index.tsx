import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthForm } from "@/components/auth/AuthForm";
import { InstitutionCodePage } from "@/components/pages/InstitutionCodePage";
import { Navbar } from "@/components/layout/Navbar";
import { HomePage } from "@/components/pages/HomePage";
import { ProfilePage } from "@/components/pages/ProfilePage";
import { ConnectPage } from "@/components/pages/ConnectPage";
import { DiscoverPage } from "@/components/pages/DiscoverPage";
import { CollaboratePage } from "@/components/pages/CollaboratePage";
import { EventsPage } from "@/components/pages/EventsPage";
import { ResourcesPage } from "@/components/pages/ResourcesPage";
import { StudyGroupsPage } from "@/components/pages/StudyGroupsPage";
import { MarketplacePage } from "@/components/pages/MarketplacePage";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { MentorDashboard } from "@/components/dashboard/MentorDashboard";
import { AuthorityDashboard } from "@/components/dashboard/AuthorityDashboard";
import { Footer } from "@/components/layout/Footer";
import { Loader2 } from "lucide-react";

interface Institution {
  id: string;
  code: string;
  name: string;
  address: string;
  contact_email: string;
  phone: string;
}

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading Colleaguee...</p>
        </div>
      </div>
    );
  }

  const handleInstitutionSelected = (institution: Institution) => {
    setSelectedInstitution(institution);
    setShowAuth(true);
  };

  const handleBackToInstitutionCode = () => {
    setShowAuth(false);
    setSelectedInstitution(null);
  };

  // Show institution code page if no user and no institution selected
  if (!user && !selectedInstitution) {
    return <InstitutionCodePage onInstitutionSelected={handleInstitutionSelected} />;
  }

  // Show auth form if institution selected but no user
  if (!user && selectedInstitution) {
    return (
      <AuthForm 
        institution={selectedInstitution} 
        onBack={handleBackToInstitutionCode} 
      />
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case "profile":
        return <ProfilePage user={user} />;
      case "connect":
        return <ConnectPage />;
      case "discover":
        return <DiscoverPage />;
      case "collaborate":
        return <CollaboratePage />;
      case "events":
        return <EventsPage />;
      case "resources":
        return <ResourcesPage />;
      case "study-groups":
        return <StudyGroupsPage />;
      case "marketplace":
        return <MarketplacePage />;
      case "home":
      default:
        return (
          <>
            <div className="bg-gradient-to-r from-primary/10 via-background to-accent/10 border-b border-border py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Hey there, {user?.user_metadata?.full_name || "Student"}! 👋
                </h2>
                <p className="text-muted-foreground">Ready to make some amazing connections and level up your college experience?</p>
              </div>
            </div>
            <Dashboard user={user} />
            <HomePage />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} currentPage={currentPage} onPageChange={setCurrentPage} />
      {renderPage()}
      <Footer />
    </div>
  );
};

export default Index;
