import React, { useState, useEffect } from 'react';
import './BlogPostDetail.css';

import { ReactComponent as HeartIcon } from '../../assets/heart.svg';
import { ReactComponent as CommentIcon } from '../../assets/comment.svg';

import { fetchBlog, increment_likes, decrement_likes } from '../../api/internalAPI';

import CommentCard from '../CommentCard/CommentCard';

const BlogPostDetail = ({ blogId, onBack }) => {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorLoading, setErrorLoading] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

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

        {/* Favorite (heart) button on the top-right */}
        <HeartIcon
          className={`heart-icon ${isFavorited ? 'favorited' : ''}`}
          onClick={handleToggleFavorite}
        />
      </div>

      <div className="detail-content">
        <h1 className="title">{post.title}</h1>
        <p className="content">{post.content}</p>

        <div className="comment-button-wrapper">
          <CommentIcon className="comment-icon" />
        </div>
      </div>

      <div className="comments-section">
        <h2>Comments</h2>
        {comments.length > 0 ? (
          comments.map((comment) => (
            <CommentCard key={comment.id} comment={comment} />
          ))
        ) : (
          <p>No comments yet.</p>
        )}
      </div>
    </div>
  );
};

export default BlogPostDetail;
