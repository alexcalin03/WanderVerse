
import React, { useState, useEffect } from 'react';
import { fetchBlogsPage, increment_reads } from '../../api/internalAPI';
import './BlogFeed.css';
import BlogCard from '../BlogCard/BlogCard';
import BlogPostDetail from '../BlogPostDetail/BlogPostDetail'; // import the detail component

const BlogFeed = ({ onSearch }) => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);


  const [selectedBlogId, setSelectedBlogId] = useState(null);

  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      try {
        const data = await fetchBlogsPage(1, perPage);
        setPosts(data.results);
        setTotalPages(data.total_pages);
        onSearch();
      } finally {
        setLoading(false);
      }
    };
    loadInitial();
  }, [perPage, onSearch]);

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

  // If the user has clicked a card, render BlogPostDetail instead of the feed.
  if (selectedBlogId !== null) {
    return (
      <div className="blog-detail-wrapper">
        <BlogPostDetail
          blogId={selectedBlogId}
          onBack={() => setSelectedBlogId(null)}
        />
      </div>
    );
  }

  // Otherwise, show the feed itself.
  return (
    <div className="blog-feed">
      {posts.map(post => (
        <div
          key={post.id}
          className="blog-card-link"
          onClick={() => {
            setSelectedBlogId(post.id);
            increment_reads(post.id);
          }}
        >
          <BlogCard post={post} />
        </div>
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
