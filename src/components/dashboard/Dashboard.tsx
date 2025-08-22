import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  BookOpen, 
  Target, 
  Flame, 
  CheckCircle, 
  Clock,
  Plus,
  TrendingUp
} from "lucide-react";

interface DashboardProps {
  user: any;
}

export const Dashboard = ({ user }: DashboardProps) => {
  const [streakCount, setStreakCount] = useState(7);
  const [todayCheckedIn, setTodayCheckedIn] = useState(false);

  const handleDailyCheckIn = () => {
    setTodayCheckedIn(true);
    setStreakCount(prev => prev + 1);
  };

  // Mock data for planner and projects
  const upcomingTasks = [
    { id: 1, title: "Complete React assignment", dueDate: "Today", priority: "high" },
    { id: 2, title: "Study for Database exam", dueDate: "Tomorrow", priority: "medium" },
    { id: 3, title: "Team project meeting", dueDate: "Friday", priority: "low" },
  ];

  const recentProjects = [
    { id: 1, title: "E-commerce Website", progress: 85, status: "active" },
    { id: 2, title: "Mobile App Design", progress: 60, status: "active" },
    { id: 3, title: "Data Analysis Tool", progress: 100, status: "completed" },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "outline";
    }
  };

  return (
    <div className="bg-gradient-to-r from-primary/5 via-background to-accent/5 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            Welcome back, {user?.user_metadata?.full_name || "Student"}! 👋
          </h2>
          <p className="text-muted-foreground">Here's what's happening with your college life</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Daily Check-in Streak */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center space-x-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <span>Daily Streak</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground mb-2">{streakCount}</div>
                <p className="text-sm text-muted-foreground mb-4">days in a row</p>
                {!todayCheckedIn ? (
                  <Button 
                    onClick={handleDailyCheckIn}
                    className="w-full"
                    size="sm"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Check in today
                  </Button>
                ) : (
                  <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                    ✓ Checked in today!
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* My Planner */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-primary/10" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span>My Planner</span>
                </div>
                <Button variant="ghost" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="space-y-3">
                {upcomingTasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground line-clamp-1">
                        {task.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{task.dueDate}</p>
                    </div>
                    <Badge variant={getPriorityColor(task.priority)} className="ml-2">
                      {task.priority}
                    </Badge>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full mt-3">
                  View all tasks
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* My Projects */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-accent/10" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-green-600" />
                  <span>My Projects</span>
                </div>
                <Button variant="ghost" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="space-y-4">
                {recentProjects.slice(0, 2).map((project) => (
                  <div key={project.id}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-foreground line-clamp-1">
                        {project.title}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {project.progress}%
                      </span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full">
                  View all projects
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="flex items-center space-x-3 p-4 bg-card/50 rounded-lg border">
            <Target className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Goals</p>
              <p className="text-xs text-muted-foreground">3 active</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-card/50 rounded-lg border">
            <Clock className="h-8 w-8 text-accent" />
            <div>
              <p className="text-sm font-medium text-foreground">Study Hours</p>
              <p className="text-xs text-muted-foreground">24h this week</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-card/50 rounded-lg border">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm font-medium text-foreground">GPA</p>
              <p className="text-xs text-muted-foreground">3.8 / 4.0</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-card/50 rounded-lg border">
            <CheckCircle className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-foreground">Completed</p>
              <p className="text-xs text-muted-foreground">12 tasks</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};