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

interface Profile {
  id: string;
  user_id: string;
  role: 'student' | 'mentor' | 'teacher' | 'authority';
  institution_id: string;
  institution_roll_number: string;
  full_name: string;
  email: string;
  daily_streak: number;
  connections_count: number;
  department: string;
}

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile when logged in
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
      } else if (data) {
        setProfile(data);
      } else {
        console.log('No profile found for user');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

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

  // Show loading if user exists but profile not loaded yet
  if (user && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
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
      case "dashboard":
        return renderDashboard();
      case "home":
      default:
        return <HomePage />;
    }
  };

  const renderDashboard = () => {
    if (!profile) return null;

    switch (profile.role) {
      case 'student':
        return <StudentDashboard user={user} profile={profile} />;
      case 'mentor':
        return <MentorDashboard user={user} profile={profile} />;
      case 'teacher':
      case 'authority':
        return <AuthorityDashboard user={user} profile={profile} />;
      default:
        return <StudentDashboard user={user} profile={profile} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} profile={profile} currentPage={currentPage} onPageChange={setCurrentPage} />
      {renderPage()}
      <Footer />
    </div>
  );
};

export default Index;
