import React from 'react';
import './CommentCard.css';

const CommentCard = ({ comment }) => {
  return (
    <div className="comment-card">
      <div className="comment-author">{comment.author_username}</div>
      <div className="comment-body">{comment.content}</div>
    </div>
  );
};

export default CommentCard;
