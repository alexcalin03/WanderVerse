
import React, { useState, useEffect } from 'react';
import { fetchBlogsPage, increment_reads, postBlog, list_favourites } from '../../api/internalAPI';
import './BlogFeed.css';
import BlogCard from '../BlogCard/BlogCard';
import BlogPostDetail from '../BlogPostDetail/BlogPostDetail'; 
import ShareExperienceForm from '../shareExperienceForm/ShareExperienceForm';
const BlogFeed = ({ onSearch }) => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showShareForm, setShowShareForm] = useState(false);
  const [filteringByUser, setFilteringByUser] = useState(false);
  const [filteringByFavourites, setFilteringByFavourites] = useState(false);
  const [currentUsername, setCurrentUsername] = useState(null);

  const [selectedBlogId, setSelectedBlogId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const username = localStorage.getItem('username');
      setCurrentUsername(username);
    }
  }, []);

  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      try {
        if (filteringByFavourites) {
          const favourites = await list_favourites();
          setPosts(favourites);
          setTotalPages(1); 
        } else {
          const username = filteringByUser ? currentUsername : null;
          const data = await fetchBlogsPage(1, perPage, username);
          setPosts(data.results);
          setTotalPages(data.total_pages);
        }
        onSearch();
      } catch (error) {
        console.error('Error loading posts:', error);
      } finally {
        setLoading(false);
      }
    };
    loadInitial();
  }, [perPage, onSearch, filteringByUser, filteringByFavourites, currentUsername]);

  const loadMore = async () => {
    if (filteringByFavourites || page >= totalPages || loading) return;
    
    const nextPage = page + 1;
    setLoading(true);
    try {
      const username = filteringByUser ? currentUsername : null;
      const data = await fetchBlogsPage(nextPage, perPage, username);
      setPosts(prevPosts => [...prevPosts, ...data.results]);
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShareClick = () => {
      setShowShareForm(true);
  };

  const handleShareClose = () => {
      setShowShareForm(false);
  };
  
  const handleShareSubmit = async (formData) => {
    try {
      const response = await postBlog(formData);
      console.log('Blog posted successfully:', response);
      const username = filteringByUser ? currentUsername : null;
      const data = await fetchBlogsPage(1, perPage, username, true);
      setPosts(data.results);
      setPage(1); 
      setShowShareForm(false);
    } catch (error) {
      console.error('Error posting blog:', error);
    }
  };

  const handleMyPostsClick = async () => {
    const newFilteringState = !filteringByUser;
    setFilteringByUser(newFilteringState);
    
    setFilteringByFavourites(false);
    
    setPage(1);
    
    setLoading(true);
    try {
      const username = newFilteringState ? currentUsername : null;
      const data = await fetchBlogsPage(1, perPage, username);
      setPosts(data.results);
      setTotalPages(data.total_pages);
    } catch (error) {
      console.error('Error filtering posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFavouritesClick = async () => {
    const newFavouritesState = !filteringByFavourites;
    setFilteringByFavourites(newFavouritesState);
    
    setFilteringByUser(false);
    
    setPage(1);
    
    setLoading(true);
    try {
      if (newFavouritesState) {
        const favourites = await list_favourites();
        setPosts(favourites);
        setTotalPages(1); 
      } else {
        const data = await fetchBlogsPage(1, perPage);
        setPosts(data.results);
        setTotalPages(data.total_pages);
      }
    } catch (error) {
      console.error('Error filtering favourites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostUpdate = (updatedPost) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === updatedPost.id ? updatedPost : post
      )
    );
  };

  const handlePostDelete = (deletedPostId) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== deletedPostId));
  };

  if (selectedBlogId !== null) {
    return (
      <div className="blog-detail-wrapper">
        <div className="share-experience-button">
          <button onClick={handleShareClick}>
            Share an Experience
          </button>
        </div>
        {showShareForm && (
          <ShareExperienceForm onClose={handleShareClose} onSubmit={handleShareSubmit} />
        )}
        <BlogPostDetail
          blogId={selectedBlogId}
          onBack={() => setSelectedBlogId(null)}
          onPostUpdate={handlePostUpdate}
          onPostDelete={handlePostDelete}
        />
      </div>
    );
  }

  return (
    <div className="blog-feed-container">
      <div className="share-experience-button">
        <button onClick={handleShareClick}>
          Share an Experience
        </button>
      </div>

      <div className="my-posts">
        <button 
          onClick={handleMyPostsClick}
          className={filteringByUser ? 'active' : ''}
        >
          {filteringByUser ? 'All Posts' : 'My Posts'}
        </button>
      </div>
      <div className="favourites-button">
        <button
          onClick={handleFavouritesClick}
          className={filteringByFavourites ? 'active' : ''}
        >
          {filteringByFavourites ? 'All Posts' : 'Favourites'}
        </button>
      </div>
      {showShareForm && (
        <ShareExperienceForm onClose={handleShareClose} onSubmit={handleShareSubmit} />
      )}
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
    </div>
  );
};

export default BlogFeed;
