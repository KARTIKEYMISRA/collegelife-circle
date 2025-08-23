import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, 
  MapPin, 
  Clock, 
  BookOpen,
  Plus,
  Search,
  Video,
  Coffee,
  Calendar,
  Star
} from "lucide-react";

const studyGroups = [
  {
    id: 1,
    name: "Advanced Calculus Study Circle",
    subject: "Mathematics",
    members: 12,
    maxMembers: 15,
    location: "Library Room 201",
    time: "Tuesdays 7 PM",
    description: "Weekly study sessions for Calc III. We focus on problem-solving and exam prep.",
    difficulty: "Advanced",
    type: "In-person",
    tags: ["calculus", "problem-solving", "exams"],
    organizer: "Sarah Chen",
    rating: 4.8,
    nextSession: "Tomorrow at 7 PM"
  },
  {
    id: 2,
    name: "React Developers Unite",
    subject: "Computer Science",
    members: 8,
    maxMembers: 10,
    location: "Virtual",
    time: "Sundays 3 PM",
    description: "Build projects together and learn modern React patterns. All skill levels welcome!",
    difficulty: "Intermediate",
    type: "Virtual",
    tags: ["react", "javascript", "projects"],
    organizer: "Alex Rodriguez",
    rating: 4.9,
    nextSession: "Sunday at 3 PM"
  },
  {
    id: 3,
    name: "Organic Chemistry Lab Prep",
    subject: "Chemistry",
    members: 6,
    maxMembers: 8,
    location: "Chem Building Lounge",
    time: "Fridays 5 PM",
    description: "Prepare for lab sessions and review organic reactions over coffee.",
    difficulty: "Intermediate",
    type: "Hybrid",
    tags: ["organic chemistry", "lab prep", "reactions"],
    organizer: "Maria Johnson",
    rating: 4.7,
    nextSession: "Friday at 5 PM"
  },
  {
    id: 4,
    name: "Physics Problem Solvers",
    subject: "Physics",
    members: 15,
    maxMembers: 20,
    location: "Physics Lab 3",
    time: "Wednesdays 6 PM",
    description: "Tackle challenging physics problems together. Quantum mechanics focus this semester.",
    difficulty: "Advanced",
    type: "In-person",
    tags: ["physics", "quantum mechanics", "problem solving"],
    organizer: "David Kim",
    rating: 4.6,
    nextSession: "Wednesday at 6 PM"
  }
];

export const StudyGroupsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Intermediate": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "Advanced": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Virtual": return <Video className="h-4 w-4" />;
      case "In-person": return <Coffee className="h-4 w-4" />;
      case "Hybrid": return <Users className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-4">
            Study Groups
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join study groups, collaborate with peers, and ace your courses together
          </p>
        </div>

        {/* Search and Create */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search study groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background border-primary/20 focus:border-primary"
            />
          </div>
          <Button className="btn-gradient text-primary-foreground gap-2">
            <Plus className="h-4 w-4" />
            Create Study Group
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Users className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">24</div>
              <p className="text-sm text-muted-foreground">Active Groups</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <BookOpen className="h-8 w-8 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold">12</div>
              <p className="text-sm text-muted-foreground">Subjects Covered</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">156</div>
              <p className="text-sm text-muted-foreground">Weekly Sessions</p>
            </CardContent>
          </Card>
        </div>

        {/* Study Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {studyGroups.map((group) => (
            <Card key={group.id} className="card-glow hover-lift group">
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex gap-2">
                    <Badge className={getDifficultyColor(group.difficulty)}>
                      {group.difficulty}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      {getTypeIcon(group.type)}
                      {group.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{group.rating}</span>
                  </div>
                </div>
                <div>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {group.name}
                  </CardTitle>
                  <CardDescription className="text-accent font-medium">
                    {group.subject}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm">{group.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {group.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Group Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{group.members}/{group.maxMembers} members</span>
                    <div className="w-16 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(group.members / group.maxMembers) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{group.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{group.time}</span>
                  </div>
                </div>

                {/* Next Session */}
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Next Session</span>
                    </div>
                    <span className="text-sm text-primary font-medium">{group.nextSession}</span>
                  </div>
                </div>

                {/* Organizer and Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                        {group.organizer.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{group.organizer}</span>
                  </div>
                  <Button size="sm" className="btn-gradient text-primary-foreground">
                    Join Group
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create Group CTA */}
        <div className="mt-12 text-center">
          <Card className="max-w-lg mx-auto glass-effect">
            <CardContent className="pt-6">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Can't find the right group?</h3>
              <p className="text-muted-foreground mb-4">Create your own study group and invite classmates to join!</p>
              <Button className="btn-gradient text-primary-foreground">
                Start Your Study Group
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};