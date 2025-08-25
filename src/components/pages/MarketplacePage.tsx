import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShoppingBag, 
  Search, 
  Plus,
  Heart,
  MessageCircle,
  MapPin,
  DollarSign,
  Clock,
  BookOpen,
  Laptop,
  Home,
  Car,
  Shirt,
  Star
} from "lucide-react";

const listings = [
  {
    id: 1,
    title: "Calculus Textbook - 9th Edition",
    price: 85,
    originalPrice: 300,
    category: "Books",
    condition: "Like New",
    seller: "Sarah Chen",
    location: "Campus Library",
    images: 1,
    likes: 12,
    description: "Barely used calculus textbook. All pages intact, no markings.",
    tags: ["mathematics", "textbook", "calculus"],
    postedAt: "2 hours ago",
    rating: 4.9
  },
  {
    id: 2,
    title: "MacBook Pro 2021 - 13 inch",
    price: 1200,
    originalPrice: 1800,
    category: "Electronics",
    condition: "Excellent",
    seller: "Alex Rodriguez",
    location: "Dorm Building A",
    images: 5,
    likes: 28,
    description: "Perfect for students! Includes charger and original box.",
    tags: ["laptop", "apple", "programming"],
    postedAt: "1 day ago",
    rating: 4.8
  },
  {
    id: 3,
    title: "Studio Apartment Sublet",
    price: 800,
    originalPrice: null,
    category: "Housing",
    condition: "Available",
    seller: "Maria Johnson",
    location: "Downtown Campus",
    images: 8,
    likes: 45,
    description: "Cozy studio near campus. Perfect for semester abroad students.",
    tags: ["apartment", "sublet", "furnished"],
    postedAt: "3 days ago",
    rating: 4.7
  },
  {
    id: 4,
    title: "Organic Chemistry Lab Kit",
    price: 120,
    originalPrice: 200,
    category: "Books",
    condition: "Good",
    seller: "David Kim",
    location: "Chemistry Building",
    images: 3,
    likes: 8,
    description: "Complete lab kit with all essential equipment and chemicals.",
    tags: ["chemistry", "lab", "equipment"],
    postedAt: "5 hours ago",
    rating: 4.6
  }
];

export const MarketplacePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Books": return <BookOpen className="h-4 w-4" />;
      case "Electronics": return <Laptop className="h-4 w-4" />;
      case "Housing": return <Home className="h-4 w-4" />;
      case "Transportation": return <Car className="h-4 w-4" />;
      case "Clothing": return <Shirt className="h-4 w-4" />;
      default: return <ShoppingBag className="h-4 w-4" />;
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "Like New": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Excellent": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "Good": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "Fair": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "Available": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-4">
            Campus Marketplace
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Buy, sell, and trade with fellow students. From textbooks to tech, find everything you need!
          </p>
        </div>

        {/* Search and Post */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="What are you looking for?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background border-primary/20 focus:border-primary"
            />
          </div>
          <Button className="btn-gradient text-primary-foreground gap-2">
            <Plus className="h-4 w-4" />
            Post Listing
          </Button>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-muted/50">
            <TabsTrigger value="all">All Items</TabsTrigger>
            <TabsTrigger value="books">Books</TabsTrigger>
            <TabsTrigger value="electronics">Electronics</TabsTrigger>
            <TabsTrigger value="housing">Housing</TabsTrigger>
            <TabsTrigger value="transport">Transport</TabsTrigger>
            <TabsTrigger value="other">Other</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card className="text-center">
                <CardContent className="pt-4">
                  <ShoppingBag className="h-6 w-6 text-primary mx-auto mb-2" />
                  <div className="text-lg font-bold">247</div>
                  <p className="text-xs text-muted-foreground">Active Listings</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-4">
                  <BookOpen className="h-6 w-6 text-accent mx-auto mb-2" />
                  <div className="text-lg font-bold">89</div>
                  <p className="text-xs text-muted-foreground">Books</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-4">
                  <Laptop className="h-6 w-6 text-primary mx-auto mb-2" />
                  <div className="text-lg font-bold">56</div>
                  <p className="text-xs text-muted-foreground">Electronics</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-4">
                  <Home className="h-6 w-6 text-accent mx-auto mb-2" />
                  <div className="text-lg font-bold">23</div>
                  <p className="text-xs text-muted-foreground">Housing</p>
                </CardContent>
              </Card>
            </div>

            {/* Listings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <Card key={listing.id} className="card-glow hover-lift group overflow-hidden">
                  {/* Image Placeholder */}
                  <div className="h-48 bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20 relative">
                    <div className="absolute top-3 left-3">
                      <Badge className={getConditionColor(listing.condition)}>
                        {listing.condition}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-background/80 hover:bg-background">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <Badge variant="secondary" className="gap-1">
                        {getCategoryIcon(listing.category)}
                        {listing.category}
                      </Badge>
                    </div>
                    <div className="absolute bottom-3 right-3 bg-background/90 rounded px-2 py-1">
                      <span className="text-xs font-medium">+{listing.images} photos</span>
                    </div>
                  </div>

                  <CardHeader className="space-y-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="group-hover:text-primary transition-colors text-base leading-tight">
                        {listing.title}
                      </CardTitle>
                      <div className="flex items-center gap-1 shrink-0">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium">{listing.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-primary">${listing.price}</span>
                      {listing.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${listing.originalPrice}
                        </span>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {listing.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {listing.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {listing.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{listing.tags.length - 2}
                        </Badge>
                      )}
                    </div>

                    {/* Location and Time */}
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{listing.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{listing.postedAt}</span>
                      </div>
                    </div>

                    {/* Seller and Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                            {listing.seller.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{listing.seller}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MessageCircle className="h-3 w-3" />
                        </Button>
                        <Button size="sm" className="btn-gradient text-primary-foreground px-3">
                          <DollarSign className="h-3 w-3 mr-1" />
                          Buy
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Other tab contents */}
          <TabsContent value="books">
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Textbooks & Study Materials</h3>
              <p className="text-muted-foreground">Find affordable textbooks and study resources from fellow students.</p>
            </div>
          </TabsContent>

          <TabsContent value="electronics">
            <div className="text-center py-12">
              <Laptop className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Tech & Electronics</h3>
              <p className="text-muted-foreground">Laptops, tablets, and gadgets perfect for student life.</p>
            </div>
          </TabsContent>

          <TabsContent value="housing">
            <div className="text-center py-12">
              <Home className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Housing & Sublets</h3>
              <p className="text-muted-foreground">Find your perfect place or sublet your space to fellow students.</p>
            </div>
          </TabsContent>

          <TabsContent value="transport">
            <div className="text-center py-12">
              <Car className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Transportation</h3>
              <p className="text-muted-foreground">Cars, bikes, and ride shares for getting around campus.</p>
            </div>
          </TabsContent>

          <TabsContent value="other">
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Other Items</h3>
              <p className="text-muted-foreground">Everything else you need for student life.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
