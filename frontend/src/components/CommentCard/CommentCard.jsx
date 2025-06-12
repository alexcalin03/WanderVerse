import React, { useState, useEffect } from 'react';
import './CommentCard.css';
import { ReactComponent as DeleteIcon } from '../../assets/delete.svg';
import { deleteComment } from '../../api/internalAPI';

const CommentCard = ({ comment, blogId, onCommentDeleted = null }) => {
  const [isAuthor, setIsAuthor] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    const currentUsername = localStorage.getItem('username');
    setIsAuthor(currentUsername && comment.author_username === currentUsername);
  }, [comment.author_username]);

  const handleDeleteClick = async (e) => {
    e.stopPropagation(); 
    
    if (window.confirm('Are you sure you want to delete this comment?')) {
      setIsDeleting(true);
      try {
        await deleteComment(blogId, comment.id);
        if (onCommentDeleted) {
          onCommentDeleted(comment.id);
        }
      } catch (error) {
        console.error('Error deleting comment:', error);
        alert('Failed to delete comment. Please try again.');
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="comment-card">
      <div className="comment-header">
        <div className="comment-author">{comment.author_username}</div>
        {isAuthor && (
          <button 
            className="delete-comment-btn" 
            onClick={handleDeleteClick}
            disabled={isDeleting}
            title="Delete comment"
          >
            <DeleteIcon className="delete-icon" />
          </button>
        )}
      </div>
      <div className="comment-body">{comment.content}</div>
    </div>
  );
};

export default CommentCard;
