import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Search, 
  MessageCircle, 
  UserPlus, 
  GraduationCap,
  BookOpen,
  Star,
  MapPin,
  Filter
} from "lucide-react";

const mockStudents = [
  {
    id: 1,
    name: "Sarah Johnson",
    department: "Computer Science",
    year: 3,
    location: "Boston, MA",
    bio: "Full-stack developer passionate about AI and machine learning",
    skills: ["React", "Python", "Machine Learning"],
    isOnline: true,
    avatar: "/placeholder.svg"
  },
  {
    id: 2,
    name: "Michael Chen",
    department: "Business Administration",
    year: 2,
    location: "New York, NY",
    bio: "Aspiring entrepreneur interested in fintech and startups",
    skills: ["Finance", "Marketing", "Business Strategy"],
    isOnline: false,
    avatar: "/placeholder.svg"
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    department: "Design",
    year: 4,
    location: "Los Angeles, CA",
    bio: "UX/UI designer creating inclusive digital experiences",
    skills: ["UI/UX", "Figma", "User Research"],
    isOnline: true,
    avatar: "/placeholder.svg"
  },
  {
    id: 4,
    name: "David Kim",
    department: "Engineering",
    year: 1,
    location: "Seattle, WA",
    bio: "Mechanical engineering student with interest in robotics",
    skills: ["CAD", "Robotics", "3D Printing"],
    isOnline: true,
    avatar: "/placeholder.svg"
  }
];

const mentors = [
  {
    id: 1,
    name: "Dr. Amanda Wilson",
    title: "Senior Software Engineer",
    company: "Google",
    department: "Computer Science",
    expertise: ["Software Architecture", "Leadership", "Career Development"],
    rating: 4.9,
    sessions: 120,
    avatar: "/placeholder.svg"
  },
  {
    id: 2,
    name: "James Rodriguez",
    title: "Product Manager",
    company: "Apple",
    department: "Business",
    expertise: ["Product Strategy", "Market Research", "Team Management"],
    rating: 4.8,
    sessions: 85,
    avatar: "/placeholder.svg"
  }
];

export const ConnectPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("students");

  const filteredStudents = mockStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Connect with Your Community
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find peers, mentors, and collaborators to enhance your college experience
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, department, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="students" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-8">
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="mentors">Mentors</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
          </TabsList>

          <TabsContent value="students">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudents.map((student) => (
                <Card key={student.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={student.avatar} />
                          <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        {student.isOnline && (
                          <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-background rounded-full" />
                        )}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{student.name}</CardTitle>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <GraduationCap className="h-4 w-4 mr-1" />
                          Year {student.year} • {student.department}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {student.bio}
                    </p>
                    <div className="flex items-center text-sm text-muted-foreground mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      {student.location}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {student.skills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" className="flex-1">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Connect
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="mentors">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mentors.map((mentor) => (
                <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={mentor.avatar} />
                        <AvatarFallback>{mentor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-xl">{mentor.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{mentor.title}</p>
                        <p className="text-sm font-medium text-primary">{mentor.company}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="text-sm font-medium">{mentor.rating}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {mentor.sessions} sessions
                        </div>
                      </div>
                      <Badge variant="outline">{mentor.department}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {mentor.expertise.map((skill, index) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" className="flex-1">
                        Request Mentorship
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="groups">
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Study Groups Coming Soon</h3>
              <p className="text-muted-foreground mb-6">
                Join study groups, clubs, and interest-based communities
              </p>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Create a Group
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};