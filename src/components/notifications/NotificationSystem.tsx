import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bell, 
  X, 
  UserPlus, 
  Check, 
  MessageCircle,
  Users,
  Calendar,
  Heart,
  FileText,
  Mail
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ConnectionRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
  message?: string;
  created_at: string;
  sender_name?: string;
  sender_avatar?: string;
}

interface Notification {
  id: string;
  type: 'connection_request' | 'post_like' | 'post_comment' | 'new_message' | 'new_post';
  title: string;
  description: string;
  created_at: string;
  read: boolean;
  user_name?: string;
  user_avatar?: string;
  icon?: any;
  action_data?: any;
}

interface NotificationSystemProps {
  currentUser: any;
}

export const NotificationSystem = ({ currentUser }: NotificationSystemProps) => {
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchConnectionRequests();
      fetchAllNotifications();
      
      // Set up real-time subscriptions
      const channel = supabase
        .channel('all_notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'connection_requests',
            filter: `receiver_id=eq.${currentUser.id}`
          },
          () => {
            fetchConnectionRequests();
            fetchAllNotifications();
            toast({
              title: "New connection request",
              description: "You have a new connection request!",
            });
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'post_likes'
          },
          (payload) => {
            checkIfUserPost(payload.new.post_id, 'like');
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'post_comments'
          },
          (payload) => {
            checkIfUserPost(payload.new.post_id, 'comment');
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages'
          },
          (payload) => {
            checkIfUserMessage(payload.new.conversation_id);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [currentUser]);

  const fetchConnectionRequests = async () => {
    if (!currentUser) return;

    const { data: requestsData } = await supabase
      .from('connection_requests')
      .select('*')
      .eq('receiver_id', currentUser.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (requestsData) {
      // Fetch sender details
      const senderIds = requestsData.map(req => req.sender_id);
      const { data: senders } = await supabase
        .from('profiles')
        .select('user_id, full_name, profile_picture_url')
        .in('user_id', senderIds);

      const sendersMap = new Map(senders?.map(s => [s.user_id, s]) || []);
      
      const requestsWithSenders = requestsData.map(req => ({
        ...req,
        sender_name: sendersMap.get(req.sender_id)?.full_name || 'Unknown',
        sender_avatar: sendersMap.get(req.sender_id)?.profile_picture_url || ''
      }));

      setConnectionRequests(requestsWithSenders);
    }
  };

  const fetchAllNotifications = async () => {
    if (!currentUser) return;

    try {
      // Fetch recent likes on user's posts
      const { data: likesData } = await supabase
        .from('post_likes')
        .select(`
          id,
          created_at,
          user_id,
          post_id,
          posts!inner(author_id, content)
        `)
        .eq('posts.author_id', currentUser.id)
        .neq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch recent comments on user's posts
      const { data: commentsData } = await supabase
        .from('post_comments')
        .select(`
          id,
          created_at,
          author_id,
          content,
          post_id,
          posts!inner(author_id)
        `)
        .eq('posts.author_id', currentUser.id)
        .neq('author_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch recent messages
      const { data: messagesData } = await supabase
        .from('messages')
        .select(`
          id,
          created_at,
          sender_id,
          content,
          conversation_id,
          conversations!inner(participant1_id, participant2_id)
        `)
        .or(`conversations.participant1_id.eq.${currentUser.id},conversations.participant2_id.eq.${currentUser.id}`)
        .neq('sender_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Get user details for all notifications
      const userIds = new Set([
        ...(likesData?.map(l => l.user_id) || []),
        ...(commentsData?.map(c => c.author_id) || []),
        ...(messagesData?.map(m => m.sender_id) || [])
      ]);

      const { data: users } = await supabase
        .from('profiles')
        .select('user_id, full_name, profile_picture_url')
        .in('user_id', Array.from(userIds));

      const usersMap = new Map(users?.map(u => [u.user_id, u]) || []);

      // Build notifications array
      const allNotifications: Notification[] = [
        ...(likesData?.map(like => ({
          id: `like_${like.id}`,
          type: 'post_like' as const,
          title: 'Post Liked',
          description: `${usersMap.get(like.user_id)?.full_name || 'Someone'} liked your post`,
          created_at: like.created_at,
          read: false,
          user_name: usersMap.get(like.user_id)?.full_name,
          user_avatar: usersMap.get(like.user_id)?.profile_picture_url,
          icon: Heart
        })) || []),
        ...(commentsData?.map(comment => ({
          id: `comment_${comment.id}`,
          type: 'post_comment' as const,
          title: 'New Comment',
          description: `${usersMap.get(comment.author_id)?.full_name || 'Someone'} commented on your post`,
          created_at: comment.created_at,
          read: false,
          user_name: usersMap.get(comment.author_id)?.full_name,
          user_avatar: usersMap.get(comment.author_id)?.profile_picture_url,
          icon: MessageCircle
        })) || []),
        ...(messagesData?.map(message => ({
          id: `message_${message.id}`,
          type: 'new_message' as const,
          title: 'New Message',
          description: `${usersMap.get(message.sender_id)?.full_name || 'Someone'} sent you a message`,
          created_at: message.created_at,
          read: false,
          user_name: usersMap.get(message.sender_id)?.full_name,
          user_avatar: usersMap.get(message.sender_id)?.profile_picture_url,
          icon: Mail
        })) || [])
      ];

      // Sort by date
      allNotifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setNotifications(allNotifications.slice(0, 20));
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const checkIfUserPost = async (postId: string, type: 'like' | 'comment') => {
    const { data: post } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', postId)
      .single();

    if (post?.author_id === currentUser.id) {
      fetchAllNotifications();
      toast({
        title: type === 'like' ? "New like" : "New comment",
        description: `Someone ${type === 'like' ? 'liked' : 'commented on'} your post!`,
      });
    }
  };

  const checkIfUserMessage = async (conversationId: string) => {
    const { data: conversation } = await supabase
      .from('conversations')
      .select('participant1_id, participant2_id')
      .eq('id', conversationId)
      .single();

    if (conversation && (conversation.participant1_id === currentUser.id || conversation.participant2_id === currentUser.id)) {
      fetchAllNotifications();
      toast({
        title: "New message",
        description: "You have a new message!",
      });
    }
  };

  const respondToConnectionRequest = async (requestId: string, accept: boolean) => {
    setLoading(true);
    try {
      if (accept) {
        // Call the database function to accept the connection
        const { error } = await supabase.rpc('accept_connection_request', {
          request_id: requestId
        });
        
        if (error) throw error;
        
        toast({
          title: "Connection accepted",
          description: "You are now connected!",
        });
      } else {
        // Reject the request
        const { error } = await supabase
          .from('connection_requests')
          .update({ status: 'rejected' })
          .eq('id', requestId);
        
        if (error) throw error;
        
        toast({
          title: "Connection declined",
          description: "Request has been declined.",
        });
      }

      fetchConnectionRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to respond to request",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const unreadCount = connectionRequests.length + notifications.length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {unreadCount === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No new notifications</p>
              </div>
            ) : (
              <ScrollArea className="h-80">
                <div className="space-y-1 p-2">
                  {/* Connection Requests */}
                  {connectionRequests.map((request) => (
                    <div 
                      key={`connection_${request.id}`} 
                      className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                         <Avatar className="h-10 w-10">
                           <AvatarImage src={request.sender_avatar || ''} />
                           <AvatarFallback>
                             {request.sender_name?.[0] || '?'}
                           </AvatarFallback>
                         </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <UserPlus className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-foreground">
                              Connection Request
                            </span>
                          </div>
                          <p className="text-sm text-foreground">
                            <span className="font-medium">{request.sender_name}</span> wants to connect
                          </p>
                          {request.message && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              "{request.message}"
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(request.created_at).toLocaleDateString()}
                          </p>
                          <div className="flex space-x-2 mt-3">
                            <Button
                              size="sm"
                              onClick={() => respondToConnectionRequest(request.id, true)}
                              disabled={loading}
                              className="flex-1"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => respondToConnectionRequest(request.id, false)}
                              disabled={loading}
                              className="flex-1"
                            >
                              <X className="h-3 w-3 mr-1" />
                              Decline
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                   {/* Other Notifications */}
                   {notifications.map((notification) => {
                     const IconComponent = notification.icon || Bell;
                     return (
                       <div 
                         key={notification.id} 
                         className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                       >
                         <div className="flex items-start space-x-3">
                           <Avatar className="h-10 w-10">
                             <AvatarImage src={notification.user_avatar || ''} />
                             <AvatarFallback>
                               {notification.user_name?.[0] || '?'}
                             </AvatarFallback>
                           </Avatar>
                           <div className="flex-1 min-w-0">
                             <div className="flex items-center space-x-2 mb-1">
                               {IconComponent && <IconComponent className="h-4 w-4 text-primary" />}
                               <span className="text-sm font-medium text-foreground">
                                 {notification.title}
                               </span>
                             </div>
                            <p className="text-sm text-foreground">
                              {notification.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(notification.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};