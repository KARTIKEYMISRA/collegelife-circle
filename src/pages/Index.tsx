import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthForm } from "@/components/auth/AuthForm";
import { Navbar } from "@/components/layout/Navbar";
import { HomePage } from "@/components/pages/HomePage";
import { ProfilePage } from "@/components/pages/ProfilePage";
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
          <p className="text-muted-foreground">Loading CollegeLife Circle...</p>
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
      case "directory":
        return (
          <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
            <div className="max-w-7xl mx-auto text-center">
              <h1 className="text-3xl font-bold text-foreground mb-4">Student Directory</h1>
              <p className="text-muted-foreground">Coming soon! Browse and connect with your peers.</p>
            </div>
          </div>
        );
      case "events":
        return (
          <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
            <div className="max-w-7xl mx-auto text-center">
              <h1 className="text-3xl font-bold text-foreground mb-4">Campus Events</h1>
              <p className="text-muted-foreground">Coming soon! Discover and join campus events.</p>
            </div>
          </div>
        );
      case "home":
      default:
        return <HomePage />;
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
