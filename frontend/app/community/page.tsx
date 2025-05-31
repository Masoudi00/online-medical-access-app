'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { fetchWithAuth } from '../utils/api';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { toast } from 'sonner';
import { Trash2, MessageCircle, ThumbsUp } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import defaultAvatar from "../../public/default-avatar.png";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  role: string;
  profile_picture: string | null;
}

interface Comment {
  id: number;
  content: string;
  created_at: string;
  user_id: number;
  user: User;
  replies: Reply[];
  likes: number;
  is_liked: boolean;
}

interface Reply {
  id: number;
  content: string;
  created_at: string;
  user_id: number;
  comment_id: number;
  user: User;
}

export default function CommunityPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyContent, setReplyContent] = useState<{ [key: number]: string }>({});
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const { translations } = useLanguage();
  const { isLoggedIn, user } = useAuth();

  const fetchComments = async () => {
    try {
      const response = await fetchWithAuth('http://localhost:8000/community/comments');
      if (!response) throw new Error('Failed to fetch comments');
      const data = await response.json();
      console.log('Current user in community page:', user);
      console.log('Comments data:', data);
      console.log('Comments with user_id:', data.map((comment: Comment) => ({
        id: comment.id,
        user_id: comment.user_id,
        user: comment.user,
        content: comment.content.substring(0, 50) + '...'
      })));
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error(translations.failedToLoad);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchComments();
    }
  }, [isLoggedIn]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await fetchWithAuth('http://localhost:8000/community/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (!response) throw new Error('Failed to post comment');
      
      setNewComment('');
      fetchComments();
      toast.success(translations.commentPosted);
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error(translations.failedToPost);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      const url = `http://localhost:8000/community/comments/${commentId}`;
      const options: RequestInit = {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      };

      // If user is admin and provided a reason, include it in the request
      if (user?.role === 'admin' && deleteReason) {
        options.body = JSON.stringify({ reason: deleteReason });
      }

      const response = await fetchWithAuth(url, options);

      if (!response) throw new Error('Failed to delete comment');
      
      setDeleteReason(''); // Reset the reason after successful deletion
      fetchComments();
      toast.success(translations.commentDeleted);
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error(translations.failedToDelete);
    }
  };

  const handleDeleteReply = async (commentId: number, replyId: number) => {
    try {
      const response = await fetchWithAuth(`http://localhost:8000/community/comments/${commentId}/replies/${replyId}`, {
        method: 'DELETE',
      });

      if (!response) throw new Error('Failed to delete reply');
      
      fetchComments();
      toast.success(translations.replyDeleted);
    } catch (error) {
      console.error('Error deleting reply:', error);
      toast.error(translations.failedToDelete);
    }
  };

  const handleSubmitReply = async (commentId: number) => {
    if (!replyContent[commentId]?.trim()) return;

    try {
      const response = await fetchWithAuth(`http://localhost:8000/community/comments/${commentId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: replyContent[commentId] }),
      });

      if (!response) throw new Error('Failed to post reply');

      setReplyContent({ ...replyContent, [commentId]: '' });
      setReplyingTo(null);
      fetchComments();
      toast.success(translations.replyPosted);
    } catch (error) {
      console.error('Error posting reply:', error);
      toast.error(translations.failedToPost);
    }
  };

  const handleLikeComment = async (commentId: number) => {
    try {
      // Log the current state before update
      const currentComment = comments.find(c => c.id === commentId);
      console.log('Before like - Comment:', currentComment);
      
      // Optimistically update the UI
      setComments(prevComments => prevComments.map(comment => 
        comment.id === commentId 
          ? { 
              ...comment, 
              likes: comment.is_liked ? comment.likes - 1 : comment.likes + 1,
              is_liked: !comment.is_liked 
            }
          : comment
      ));

      console.log('Sending like request for comment:', commentId);
      const response = await fetchWithAuth(`http://localhost:8000/community/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response) {
        console.error('No response from server');
        throw new Error('No response from server');
      }

      const data = await response.json();
      console.log('Like response:', data);
      
      // Update with actual server response
      setComments(prevComments => {
        const newComments = prevComments.map(comment => 
          comment.id === commentId 
            ? { ...comment, likes: data.likes, is_liked: data.is_liked }
            : comment
        );
        console.log('Updated comments:', newComments);
        return newComments;
      });

      // Show success message
      toast.success(data.message);
    } catch (error) {
      console.error('Error liking comment:', error);
      toast.error(translations.failedToLike);
      
      // Revert the optimistic update on error
      setComments(prevComments => prevComments.map(comment => 
        comment.id === commentId 
          ? { ...comment, likes: comment.likes - 1, is_liked: !comment.is_liked }
          : comment
      ));
    }
  };

  const UserBadge = ({ role }: { role: string }) => {
    if (role === 'doctor') {
      return (
        <Badge variant="secondary" className="ml-2">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {translations.verifiedDoctor}
        </Badge>
      );
    }
    if (role === 'admin') {
      return (
        <Badge variant="destructive" className="ml-2">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          {translations.admin}
        </Badge>
      );
    }
    return null;
  };

  const canDelete = (userId: number) => {
    console.log('Checking delete permission:', {
      currentUserId: user?.id,
      commentUserId: userId,
      userRole: user?.role,
      isAdmin: user?.role === 'admin',
      canDelete: user?.id === userId || user?.role === 'admin'
    });
    
    if (!user) {
      console.log('No user data available');
      return false;
    }
    
    const hasPermission = user.id === userId || user.role === 'admin';
    console.log('Permission result:', hasPermission);
    return hasPermission;
  };

  // Add filtered comments logic
  const filteredComments = comments.filter(comment => {
    const searchLower = searchQuery.toLowerCase();
    const contentMatch = comment.content.toLowerCase().includes(searchLower);
    const authorMatch = `${comment.user.first_name} ${comment.user.last_name}`.toLowerCase().includes(searchLower);
    const replyMatch = comment.replies.some(reply => 
      reply.content.toLowerCase().includes(searchLower) ||
      `${reply.user.first_name} ${reply.user.last_name}`.toLowerCase().includes(searchLower)
    );
    return contentMatch || authorMatch || replyMatch;
  });

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">{translations.pleaseLogin}</h2>
          <Button onClick={() => window.location.href = '/login'}>
            {translations.login}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{translations.community}</h1>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={translations.searchPosts || "Search posts..."}
            className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

     

      {/* New Comment Form */}
      <div className="mb-8 bg-gray-900/50 p-6 rounded-lg shadow-lg">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10 border-2 border-gray-700">
            <AvatarImage 
              src={user?.profile_picture 
                ? (user.profile_picture.startsWith('http') 
                  ? user.profile_picture 
                  : `http://localhost:8000${user.profile_picture}`)
                : "/default-avatar.png"} 
              alt={`${user?.first_name} ${user?.last_name}`} 
            />
            <AvatarFallback>{user?.first_name?.[0]}{user?.last_name?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={translations.writeComment}
              className="mb-4 bg-gray-800/50 min-h-[100px]"
            />
            <Button 
              onClick={handleSubmitComment} 
              disabled={!newComment.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {translations.post}
            </Button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredComments.map((comment) => (
            <div key={comment.id} className="bg-gray-900/50 p-6 rounded-lg shadow-lg transition-all hover:shadow-xl">
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10 border-2 border-gray-700">
                  <AvatarImage 
                    src={comment.user.profile_picture 
                      ? (comment.user.profile_picture.startsWith('http') 
                        ? comment.user.profile_picture 
                        : `http://localhost:8000${comment.user.profile_picture}`)
                      : "/default-avatar.png"} 
                    alt={`${comment.user.first_name} ${comment.user.last_name}`} 
                  />
                  <AvatarFallback>{comment.user.first_name[0]}{comment.user.last_name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {comment.user.first_name} {comment.user.last_name}
                      </span>
                      <UserBadge role={comment.user.role} />
                    </div>
                    {canDelete(comment.user_id) && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{translations.confirmDelete}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {translations.confirmDeleteComment}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          {user?.role === 'admin' && comment.user_id !== user.id && (
                            <div className="mb-4">
                              <label htmlFor="deleteReason" className="block text-sm font-medium text-gray-400 mb-2">
                                Reason for deletion
                              </label>
                              <Textarea
                                id="deleteReason"
                                value={deleteReason}
                                onChange={(e) => setDeleteReason(e.target.value)}
                                placeholder="Enter reason for deletion"
                                className="w-full bg-gray-800/50"
                              />
                            </div>
                          )}
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setDeleteReason('')}>{translations.cancel}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteComment(comment.id)}
                              className="bg-red-500 hover:bg-red-600"
                              disabled={user?.role === 'admin' && comment.user_id !== user.id && !deleteReason}
                            >
                              {translations.delete}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                  <span className="text-sm text-gray-400">
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                  <p className="mt-2 text-gray-100">{comment.content}</p>
                </div>
              </div>

              {/* Comment Actions */}
              <div className="flex items-center gap-4 mt-4 ml-14">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLikeComment(comment.id)}
                  className={`gap-2 ${comment.is_liked ? 'text-blue-500 hover:text-blue-600' : 'text-gray-400 hover:text-gray-300'}`}
                >
                  <ThumbsUp className={`h-4 w-4 ${comment.is_liked ? 'fill-current' : ''}`} />
                  {comment.likes}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="text-gray-400 hover:text-gray-300 gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  {translations.reply}
                </Button>
              </div>

              {/* Reply Form */}
              {replyingTo === comment.id && (
                <div className="ml-14 mt-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-8 w-8 border-2 border-gray-700">
                      <AvatarImage 
                        src={user?.profile_picture 
                          ? (user.profile_picture.startsWith('http') 
                            ? user.profile_picture 
                            : `http://localhost:8000${user.profile_picture}`)
                          : "/default-avatar.png"} 
                        alt={`${user?.first_name} ${user?.last_name}`} 
                      />
                      <AvatarFallback>{user?.first_name?.[0]}{user?.last_name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        value={replyContent[comment.id] || ''}
                        onChange={(e) => setReplyContent({ ...replyContent, [comment.id]: e.target.value })}
                        placeholder={translations.writeReply}
                        className="mb-2 bg-gray-800/50"
                      />
                      <Button
                        onClick={() => handleSubmitReply(comment.id)}
                        disabled={!replyContent[comment.id]?.trim()}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {translations.reply}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Replies */}
              {comment.replies.length > 0 && (
                <div className="ml-14 mt-4 space-y-4">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="bg-gray-800/30 p-4 rounded-lg">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-8 w-8 border-2 border-gray-700">
                          <AvatarImage 
                            src={reply.user.profile_picture 
                              ? (reply.user.profile_picture.startsWith('http') 
                                ? reply.user.profile_picture 
                                : `http://localhost:8000${reply.user.profile_picture}`)
                              : "/default-avatar.png"} 
                            alt={`${reply.user.first_name} ${reply.user.last_name}`} 
                          />
                          <AvatarFallback>{reply.user.first_name[0]}{reply.user.last_name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">
                                {reply.user.first_name} {reply.user.last_name}
                              </span>
                              <UserBadge role={reply.user.role} />
                            </div>
                            {canDelete(reply.user_id) && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>{translations.confirmDelete}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {translations.confirmDeleteReply}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>{translations.cancel}</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteReply(comment.id, reply.id)}
                                      className="bg-red-500 hover:bg-red-600"
                                    >
                                      {translations.delete}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                          <span className="text-sm text-gray-400">
                            {new Date(reply.created_at).toLocaleString()}
                          </span>
                          <p className="mt-2 text-gray-100">{reply.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 