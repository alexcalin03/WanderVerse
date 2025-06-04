
import React from 'react';
import './BlogCard.css';
import { useNavigate } from 'react-router-dom';

const BlogCard = ({ post, onLike, onReadMore }) => {
  const navigate = useNavigate();
  
  const handleReadMore = () => {
    if (onReadMore) {
      onReadMore(post.id);
    }
    navigate(`/blog/${post.id}`);
  };
  
  const handleLike = (e) => {
    e.stopPropagation();
    if (onLike) {
      onLike(post.id);
    }
  };

  return (
    <div className="blog-card">
      <div className="blog-card-header">
        <div className="blog-card-author">{post.author_username}</div>
        <div className="blog-card-location">{post.location}</div>
      </div>
      
      <div className="blog-card-content" onClick={handleReadMore}>
        <h3 className="blog-card-title">{post.title}</h3>
        <p className="blog-card-excerpt">{post.excerpt}</p>
      </div>
      
      <div className="blog-card-footer">
        <div className="blog-card-stats">
          <div className="blog-card-likes">
            <i className="fa fa-heart" onClick={handleLike}></i> {post.likes}
          </div>
          <div className="blog-card-reads">
            <i className="fa fa-eye"></i> {post.reads}
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