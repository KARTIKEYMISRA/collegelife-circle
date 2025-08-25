import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Users, 
  CheckCircle2, 
  Clock,
  AlertTriangle,
  TrendingUp,
  Zap,
  Shield,
  Calendar,
  BarChart3,
  X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { GoalManager } from "@/components/goals/GoalManager";
import { AchievementManager } from "@/components/achievements/AchievementManager";

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

interface AuthorityDashboardProps {
  user: any;
  profile: Profile;
}

export const AuthorityDashboard = ({ user, profile }: AuthorityDashboardProps) => {
  const [approvalRequests, setApprovalRequests] = useState([]);
  const [workAssignments, setWorkAssignments] = useState([]);
  const [institutionStats, setInstitutionStats] = useState({
    totalStudents: 0,
    totalMentors: 0,
    totalTeachers: 0,
    activeEvents: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch approval requests assigned to this authority
      const { data: requestsData } = await supabase
        .from('approval_requests')
        .select(`
          *,
          requester:profiles!approval_requests_requested_by_fkey(*)
        `)
        .eq('assigned_to', profile.id)
        .eq('status', 'pending')
        .limit(10);

      // Fetch work assignments
      const { data: workData } = await supabase
        .from('work_assignments')
        .select('*')
        .or(`assigned_by.eq.${profile.id},assigned_to.eq.${profile.id}`)
        .limit(10);

      // Fetch institution statistics
      const { data: studentsCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('institution_id', profile.institution_id)
        .eq('role', 'student');

      const { data: mentorsCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('institution_id', profile.institution_id)
        .eq('role', 'mentor');

      const { data: teachersCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('institution_id', profile.institution_id)
        .eq('role', 'teacher');

      const { data: eventsCount } = await supabase
        .from('campus_events')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true);

      setApprovalRequests(requestsData || []);
      setWorkAssignments(workData || []);
      setInstitutionStats({
        totalStudents: studentsCount?.length || 0,
        totalMentors: mentorsCount?.length || 0,
        totalTeachers: teachersCount?.length || 0,
        activeEvents: eventsCount?.length || 0
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalRequest = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      const status = action === 'approve' ? 'approved' : 'rejected';
      
      const { error } = await supabase
        .from('approval_requests')
        .update({ status })
        .eq('id', requestId);

      if (!error) {
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Error handling approval request:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "outline";
      case "urgent": return "destructive";
      default: return "secondary";
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
          Authority Dashboard 🏛️
        </h1>
        <p className="text-muted-foreground text-lg">
          {profile.full_name} • {profile.role === 'authority' ? 'Administrative Oversight' : 'Academic Leadership'}
        </p>
      </div>

      {/* Institution Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-effect hover-lift">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-500/10 rounded-full mx-auto mb-2">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-500">{institutionStats.totalStudents}</div>
            <div className="text-sm text-muted-foreground">Students</div>
          </CardContent>
        </Card>

        <Card className="glass-effect hover-lift">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-500/10 rounded-full mx-auto mb-2">
              <Shield className="h-6 w-6 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-green-500">{institutionStats.totalMentors}</div>
            <div className="text-sm text-muted-foreground">Mentors</div>
          </CardContent>
        </Card>

        <Card className="glass-effect hover-lift">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-500/10 rounded-full mx-auto mb-2">
              <BarChart3 className="h-6 w-6 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-purple-500">{institutionStats.totalTeachers}</div>
            <div className="text-sm text-muted-foreground">Teachers</div>
          </CardContent>
        </Card>

        <Card className="glass-effect hover-lift">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-500/10 rounded-full mx-auto mb-2">
              <Calendar className="h-6 w-6 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-orange-500">{institutionStats.activeEvents}</div>
            <div className="text-sm text-muted-foreground">Active Events</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Approval Requests */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Pending Approvals ({approvalRequests.length})
              </CardTitle>
              <CardDescription>Requests requiring your approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {approvalRequests.length > 0 ? (
                  approvalRequests.map((request: any) => (
                    <div key={request.id} className="p-4 border border-border/50 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{request.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{request.description}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>From: {request.requester?.full_name}</span>
                            <span>•</span>
                            <span>Type: {request.request_type}</span>
                          </div>
                        </div>
                        <Badge variant={getPriorityColor(request.priority)}>
                          {request.priority}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleApprovalRequest(request.id, 'approve')}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleApprovalRequest(request.id, 'reject')}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No pending approvals</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Work Management */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-accent" />
                Work Management
              </CardTitle>
              <CardDescription>Assignments and administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workAssignments.length > 0 ? (
                  workAssignments.map((task: any) => (
                    <div key={task.id} className="flex items-center justify-between p-3 border border-border/50 rounded-lg">
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                        {task.due_date && (
                          <p className="text-xs text-muted-foreground">
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                          {task.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No work assignments</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Create Announcement
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Event
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Reports
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 border border-border/50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">5 new students enrolled</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 border border-border/50 rounded-lg">
                  <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Event approved</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 border border-border/50 rounded-lg">
                  <div className="w-8 h-8 bg-orange-500/10 rounded-full flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New event created</p>
                    <p className="text-xs text-muted-foreground">3 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Integrated Components */}
      <Tabs defaultValue="goals" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>
        <TabsContent value="goals" className="mt-6">
          <GoalManager />
        </TabsContent>
        <TabsContent value="achievements" className="mt-6">
          <AchievementManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};