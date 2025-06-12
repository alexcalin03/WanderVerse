import React, { useState, useEffect } from 'react';
import './BlogPostDetail.css';

import { ReactComponent as HeartIcon } from '../../assets/heart.svg';
import { ReactComponent as CommentIcon } from '../../assets/comment.svg';

import { fetchBlog, increment_likes, decrement_likes, postComment } from '../../api/internalAPI';

import CommentCard from '../CommentCard/CommentCard';
import ShareExperienceForm from '../shareExperienceForm/ShareExperienceForm';


const BlogPostDetail = ({ blogId, onBack, onPostUpdate = null, onPostDelete = null }) => {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorLoading, setErrorLoading] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isAuthor, setIsAuthor] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    content: '',
    location: ''
  });

  useEffect(() => {
    async function loadDetail() {
      setLoading(true);
      setErrorLoading(false);

      try {
        const data = await fetchBlog(blogId);
        console.log('fetchBlog returned:', data);

        if (data && data.blog) {
          setPost(data.blog);
          setComments(Array.isArray(data.comments) ? data.comments : []);
          setIsFavorited(data.is_liked);
          setLikesCount(data.likes_count);
          
          // Check if current user is the author
          const currentUsername = localStorage.getItem('username');
          const isPostAuthor = currentUsername && data.blog.user === currentUsername;
          setIsAuthor(isPostAuthor);
          
          // Initialize edit form data
          setEditFormData({
            title: data.blog.title,
            content: data.blog.content,
            location: data.blog.location
          });
        } else {
          setErrorLoading(true);
        }
      } catch (err) {
        console.error('Error fetching blog detail:', err);
        setErrorLoading(true);
      } finally {
        setLoading(false);
      }
    }

    loadDetail();
  }, [blogId]);

  // Handle the edit form submission
  const handleEditSubmit = async (postData) => {
    try {
      // Call API to update the post
      const response = await fetch(`http://127.0.0.1:8000/blog/${blogId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(postData)
      });
      
      if (response.ok) {
        const updatedData = await response.json();
        
        setPost(updatedData.blog);
        setEditMode(false);
        
        // Notify parent component that post was updated
        if (onPostUpdate) {
          onPostUpdate(updatedData.blog);
        }
        
        alert('Post updated successfully!');
      } else {
        const errorData = await response.json();
        console.error('Error updating post:', errorData);
        alert('Failed to update post. Please try again.');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      alert('An error occurred while updating the post.');
    }
  };
  
  // Handle post deletion
  const handleDeletePost = async () => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/blog/${blogId}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Token ${localStorage.getItem('authToken')}`
          }
        });
        
        if (response.ok) {
          // Notify parent component that post was deleted
          if (onPostDelete) {
            onPostDelete(blogId);
          }
          
          // Go back to the feed after successful deletion
          alert('Post deleted successfully.');
          onBack();
        } else {
          const errorData = await response.json();
          console.error('Error deleting post:', errorData);
          alert('Failed to delete post. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('An error occurred while deleting the post.');
      }
    }
  };

  const handleToggleFavorite = async () => {
    if (!post) return;

    try {
      if (isFavorited) {
        await decrement_likes(blogId);
        setIsFavorited(false);
      } else {
        await increment_likes(blogId);
        setIsFavorited(true);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    setSubmittingComment(true);
    try {
      const newComment = await postComment(blogId, commentText);
      setComments([...comments, newComment]);
      setCommentText('');
      setShowCommentForm(false);
    } catch (err) {
      console.error('Error posting comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };
  
  const handleCommentDeleted = (deletedCommentId) => {
    // Filter out the deleted comment
    setComments(comments.filter(comment => comment.id !== deletedCommentId));
  };
  
  const toggleCommentForm = () => {
    setShowCommentForm(!showCommentForm);
  };

  if (loading) {
    return <div className="detail-loading">Loading...</div>;
  }

  if (errorLoading || !post) {
    return (
      <div className="detail-error">
        <p>
          Sorry, we couldn’t load that post. It might not exist or there was a
          server error.
        </p>
        <button className="back-button" onClick={onBack}>
          ← Back to Feed
        </button>
      </div>
    );
  }

  return (
    <div className="blog-detail">
      {editMode && (
        <ShareExperienceForm 
          onClose={() => setEditMode(false)} 
          onSubmit={handleEditSubmit}
          editMode={true}
          postData={{
            id: post.id,
            title: post.title,
            content: post.content,
            location: post.location
          }}
        />
      )}
      <button className="back-button" onClick={onBack}>
        ← Back to Feed
      </button>

      <div className="detail-header">
        <div className="author-location">
          {/* Username on the top-left */}
          <span className="author">{post.user}</span>
          {/* Location immediately after username */}
          <span className="location">— {post.location}</span>
        </div>

        
        <HeartIcon
          className={`heart-icon ${isFavorited ? 'favorited' : ''}`}
          onClick={handleToggleFavorite}
        />
      </div>

      {isAuthor && !editMode && (
        <div className="author-actions">
          <button 
            className="edit-button" 
            onClick={() => setEditMode(true)}
          >
            Edit Post
          </button>
          <button 
            className="delete-button" 
            onClick={() => handleDeletePost()}
          >
            Delete Post
          </button>
        </div>
      )}

      <div className="post-content-wrapper">
        <div className="detail-content">
          <h1 className="title">{post.title}</h1>
          <p className="content">{post.content}</p>
        </div>

        <div className="comment-button-wrapper">
          <div onClick={toggleCommentForm} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <CommentIcon className="comment-icon" />
            <span style={{ marginLeft: '5px' }}>Add Comment</span>
          </div>
          
          {showCommentForm && (
            <form onSubmit={handleCommentSubmit} className="comment-form">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write your comment..."
                rows="3"
                required
              />
              <div className="comment-form-actions">
                <button 
                  type="button" 
                  onClick={() => setShowCommentForm(false)}
                  className="cancel-button"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submittingComment || !commentText.trim()}
                  className="submit-button"
                >
                  {submittingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="comments-section">
          <h2>Comments</h2>
          {comments.length > 0 ? (
            comments.map((comment) => (
              <CommentCard 
                key={comment.id} 
                comment={comment} 
                blogId={blogId}
                onCommentDeleted={handleCommentDeleted}
              />
            ))
          ) : (
            <p>No comments yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogPostDetail;
