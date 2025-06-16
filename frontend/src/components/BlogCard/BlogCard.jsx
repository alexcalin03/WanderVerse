import React, { useState, useEffect } from 'react';
import './BlogCard.css';
import { increment_reads } from '../../api/internalAPI';
import { ReactComponent as HeartIcon } from '../../assets/heart.svg';
import { ReactComponent as EyeIcon } from '../../assets/eye.svg';

const BlogCard = ({ post, onReadMore }) => {
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [currentUsername, setCurrentUsername] = useState('');
  
  useEffect(() => {
    const username = localStorage.getItem('username');
    if (username) {
      setCurrentUsername(username);
    }
  }, []);



  const handleReadMore = () => {
    if (onReadMore) {
      onReadMore(post.id);
      increment_reads(post.id);
    }
  };



  return (
    <div className="blog-card">
      <div className="blog-card-header">
        <div className="blog-card-author">
          {currentUsername && post.author_username === currentUsername ? 'Me' : post.author_username}
        </div>
        <div className="blog-card-location">{post.location}</div>
      </div>

      <div className="blog-card-content" onClick={handleReadMore}>
        <h3 className="blog-card-title">{post.title}</h3>
        <p className="blog-card-excerpt">{post.excerpt}</p>
      </div>

      <div className="blog-card-footer">
        <div className="blog-card-stats">
          <div className="blog-card-likes">
            <HeartIcon className={`heart-icon ${isLiked ? 'liked' : ''}`} />
            <span className="like-count">{likesCount}</span>
          </div>
          <div className="blog-card-reads">
            <EyeIcon className="blog-card-eye" />
            <span className="read-count">{post.reads}</span>
          </div>
        </div>
        <div className="blog-card-date">
          {new Date(post.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
