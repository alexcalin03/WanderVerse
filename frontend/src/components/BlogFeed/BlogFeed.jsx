import React, { useState, useEffect } from 'react';
import BlogCard from '../BlogCard/BlogCard';
import { fetchBlogsPage } from '../../api/internalAPI';
import './BlogFeed.css';

const BlogFeed = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      try {
        const data = await fetchBlogsPage(1, perPage);
        setPosts(data.results);
        setTotalPages(data.total_pages);
      } finally {
        setLoading(false);
      }
    };
    loadInitial();
  }, [perPage]);

  const loadMore = async () => {
    if (page >= totalPages || loading) return;
    const nextPage = page + 1;
    setLoading(true);
    try {
      const data = await fetchBlogsPage(nextPage, perPage);
      setPosts(prev => [...prev, ...data.results]);
      setPage(nextPage);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (id) => {
    // placeholder for like logic
  };

  const handleReadMore = (id) => {
    // placeholder for read-more logic
  };

  return (
    <div className="blog-feed">
      {posts.map(post => (
        <BlogCard
          key={post.id}
          post={post}
          onLike={handleLike}
          onReadMore={handleReadMore}
        />
      ))}
      {page < totalPages && (
        <button
          className="load-more-btn"
          onClick={loadMore}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
};

export default BlogFeed;
