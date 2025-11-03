import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Calendar, 
  Target, 
  Trophy, 
  BookOpen, 
  Clock,
  TrendingUp,
  MessageCircle,
  Plus,
  Award,
  CheckCircle2,
  Star,
  Zap,
  Flame,
  Bell,
  Megaphone,
  Crown
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { GoalManager } from "@/components/goals/GoalManager";
import { StudyHourTracker } from "@/components/study/StudyHourTracker";
import { AchievementManager } from "@/components/achievements/AchievementManager";
import { TaskManager } from "./TaskManager";
import { CertificateManager } from "./CertificateManager";
import { ProjectManager } from "./ProjectManager";

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
}

interface StudentDashboardProps {
  user: any;
  profile: Profile;
}

export const StudentDashboard = ({ user, profile }: StudentDashboardProps) => {
  const [certificates, setCertificates] = useState([]);
  const [projects, setProjects] = useState([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [streakCount, setStreakCount] = useState(0);
  const [todayCheckedIn, setTodayCheckedIn] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    checkStreakStatus();
  }, [user]);

  const checkStreakStatus = async () => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('daily_streak, last_activity_date')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        setStreakCount(profileData.daily_streak || 0);
        
        // Check if user already checked in today
        const today = new Date().toISOString().split('T')[0];
        const lastActivity = profileData.last_activity_date;
        setTodayCheckedIn(lastActivity === today);
      }
    } catch (error) {
      console.error('Error checking streak status:', error);
    }
  };

  const handleDailyCheckIn = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('daily_streak, last_activity_date')
        .eq('user_id', user.id)
        .single();

      let newStreak = 1;
      if (profileData?.last_activity_date === yesterday) {
        // Consecutive day - increment streak
        newStreak = (profileData.daily_streak || 0) + 1;
      } else if (profileData?.last_activity_date === today) {
        // Already checked in today
        return;
      }

      // Update profile with new streak
      const { error } = await supabase
        .from('profiles')
        .update({
          daily_streak: newStreak,
          last_activity_date: today
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setStreakCount(newStreak);
      setTodayCheckedIn(true);
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch certificates
      const { data: certsData } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', user.id)
        .limit(3);

      // Fetch projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .limit(3);

      // Fetch announcements
      const { data: announcementsData } = await supabase
        .from('announcements')
        .select(`
          *,
          profiles:created_by (full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch leaderboard - top users by streak
      const { data: leaderboardData } = await supabase
        .from('profiles')
        .select('user_id, full_name, daily_streak, profile_picture_url, department')
        .order('daily_streak', { ascending: false })
        .limit(10);

      setCertificates(certsData || []);
      setProjects(projectsData || []);
      setAnnouncements(announcementsData || []);
      setLeaderboard(leaderboardData || []);
      
      // Initialize with empty tasks array - will be managed by TaskManager
      setUpcomingTasks([]);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded" />
                  <div className="h-3 bg-muted rounded w-5/6" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Welcome back, {profile.full_name}! 👋
        </h1>
        <p className="text-muted-foreground text-lg">
          {profile.institution_roll_number} • Ready to crush your goals today?
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-effect hover-lift">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-500/10 rounded-full mx-auto mb-2">
              <Flame className="h-6 w-6 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-orange-500">{streakCount}</div>
            <div className="text-sm text-muted-foreground mb-2">Day Streak</div>
            {!todayCheckedIn ? (
              <Button 
                onClick={handleDailyCheckIn}
                size="sm"
                className="w-full text-xs"
              >
                Check In
              </Button>
            ) : (
              <Badge variant="default" className="bg-green-500 text-xs">
                ✓ Done!
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card className="glass-effect hover-lift">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-accent/10 rounded-full mx-auto mb-2">
              <Users className="h-6 w-6 text-accent" />
            </div>
            <div className="text-2xl font-bold text-accent">{profile.connections_count}</div>
            <div className="text-sm text-muted-foreground">Connections</div>
          </CardContent>
        </Card>

        <Card className="glass-effect hover-lift">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-500/10 rounded-full mx-auto mb-2">
              <Trophy className="h-6 w-6 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-green-500">{certificates.length}</div>
            <div className="text-sm text-muted-foreground">Certificates</div>
          </CardContent>
        </Card>

        <Card className="glass-effect hover-lift">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-500/10 rounded-full mx-auto mb-2">
              <BookOpen className="h-6 w-6 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-500">{projects.length}</div>
            <div className="text-sm text-muted-foreground">Projects</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Announcements Section */}
          <Card className="glass-effect border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-primary" />
                Announcements
              </CardTitle>
              <CardDescription>Latest updates from authorities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {announcements.length > 0 ? (
                  announcements.map((announcement) => (
                    <div 
                      key={announcement.id}
                      className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-xs">
                              {announcement.announcement_type === 'department_update' && 'Department'}
                              {announcement.announcement_type === 'college_circular' && 'College'}
                              {announcement.announcement_type === 'club_event' && 'Club/Event'}
                              {announcement.announcement_type === 'authority_alert' && 'Alert'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(announcement.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="font-semibold text-sm mb-1">{announcement.title}</h4>
                          <p className="text-sm text-muted-foreground">{announcement.content}</p>
                          {announcement.profiles && (
                            <p className="text-xs text-muted-foreground mt-2">
                              By: {announcement.profiles.full_name}
                            </p>
                          )}
                        </div>
                        <Bell className="h-4 w-4 text-primary flex-shrink-0" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No announcements yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Upcoming Tasks
              </CardTitle>
              <CardDescription>Your assignments and deadlines</CardDescription>
            </CardHeader>
            <CardContent>
              <TaskManager tasks={upcomingTasks} onTasksChange={setUpcomingTasks} />
            </CardContent>
          </Card>

          {/* Recent Projects */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-accent" />
                Recent Projects
              </CardTitle>
              <CardDescription>Your active and completed projects</CardDescription>
            </CardHeader>
            <CardContent>
              <ProjectManager 
                projects={projects} 
                onProjectsChange={setProjects} 
                userId={user.id} 
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Leaderboard */}
          <Card className="glass-effect border-t-4 border-t-yellow-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Top Contributors
              </CardTitle>
              <CardDescription>Streak Leaderboard</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {leaderboard.length > 0 ? (
                  leaderboard.map((leader, index) => (
                    <div 
                      key={leader.user_id}
                      className={`flex items-center gap-3 p-2 rounded-lg ${
                        leader.user_id === user.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-accent/5'
                      } transition-colors`}
                    >
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-orange-600 text-white' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={leader.profile_picture_url} />
                        <AvatarFallback>{leader.full_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {leader.full_name}
                          {leader.user_id === user.id && (
                            <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{leader.department}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Flame className="h-4 w-4 text-orange-500" />
                        <span className="font-bold text-sm text-orange-500">{leader.daily_streak}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No leaderboard data yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Certificates */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Recent Certificates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CertificateManager 
                certificates={certificates} 
                onCertificatesChange={setCertificates} 
                userId={user.id} 
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Integrated Components */}
      <Tabs defaultValue="goals" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="study">Study Tracker</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>
        <TabsContent value="goals" className="mt-6">
          <GoalManager />
        </TabsContent>
        <TabsContent value="study" className="mt-6">
          <StudyHourTracker />
        </TabsContent>
        <TabsContent value="achievements" className="mt-6">
          <AchievementManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};