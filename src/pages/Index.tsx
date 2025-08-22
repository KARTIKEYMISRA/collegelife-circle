import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthForm } from "@/components/auth/AuthForm";
import { Navbar } from "@/components/layout/Navbar";
import { HomePage } from "@/components/pages/HomePage";
import { ProfilePage } from "@/components/pages/ProfilePage";
import { ConnectPage } from "@/components/pages/ConnectPage";
import { DiscoverPage } from "@/components/pages/DiscoverPage";
import { CollaboratePage } from "@/components/pages/CollaboratePage";
import { EventsPage } from "@/components/pages/EventsPage";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState("home");

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

  if (!user) {
    return <AuthForm />;
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
      case "home":
      default:
        return (
          <>
            <div className="bg-gradient-to-r from-primary/10 via-background to-accent/10 border-b border-border py-4">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-xl font-semibold text-foreground">
                  Welcome back, {user?.user_metadata?.full_name || "Student"}! 🎓
                </h2>
                <p className="text-muted-foreground">Ready to connect and collaborate with your peers?</p>
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
    </div>
  );
};

export default Index;
