import axios from 'axios';
const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';

axios.defaults.baseURL = API_BASE;
axios.defaults.headers.common['Content-Type'] = 'application/json';

const axiosWithAuth = {
  get: (url, config = {}) => {
    return axios.get(url, {
      ...config,
      headers: {
        ...config.headers,
        'Authorization': `Token ${localStorage.getItem('authToken')}`
      }
    });
  },
  post: (url, data = {}, config = {}) => {
    return axios.post(url, data, {
      ...config,
      headers: {
        ...config.headers,
        'Authorization': `Token ${localStorage.getItem('authToken')}`
      }
    });
  },
  put: (url, data = {}, config = {}) => {
    return axios.put(url, data, {
      ...config,
      headers: {
        ...config.headers,
        'Authorization': `Token ${localStorage.getItem('authToken')}`
      }
    });
  },
  delete: (url, config = {}) => {
    return axios.delete(url, {
      ...config,
      headers: {
        ...config.headers,
        'Authorization': `Token ${localStorage.getItem('authToken')}`
      }
    });
  },
  patch: (url, data = {}, config = {}) => {
    return axios.patch(url, data, {
      ...config,
      headers: {
        ...config.headers,
        'Authorization': `Token ${localStorage.getItem('authToken')}`
      }
    });
  }
};

const cache = {};

export async function fetchBlogsPage(page = 1, perPage = 15, username = null, skipCache = false) {
  const cacheKey = `blogs?page=${page}&per_page=${perPage}${username ? '&username=' + username : ''}`;
  
  // Use cache if available and skipCache is false
  if (!skipCache && cache[cacheKey]) {
    return cache[cacheKey];
  }
  
  let url = `/blogs/?page=${page}&per_page=${perPage}`;
  if (username) {
    url += `&username=${username}`;
  }
  
  const response = await axiosWithAuth.get(url);
  const data = response.data;
  cache[cacheKey] = data;
  return data;
}

export async function increment_likes(blog_id) {
  const url = `/blog/${blog_id}/likes/`;
  await axiosWithAuth.post(url);
}

export async function increment_reads(blog_id) {
  const url = `/blog/${blog_id}/reads/`;
  await axiosWithAuth.post(url);
}

export async function decrement_likes(blog_id) {
  const url = `/blog/${blog_id}/likes/`;
  await axios.delete(url);
}

export async function fetchBlog(blog_id) {
  const url = `/blog/${blog_id}/`;
  const response = await axiosWithAuth.get(url);
  return response.data;
}

export async function postComment(blogId, content) {
  const url = `/blog/${blogId}/comments/`;
  const response = await axiosWithAuth.post(url, { content });
  return response.data;
}

export async function postBlog(blogData) {
  const url = `/blog/`;
  const response = await axiosWithAuth.post(url, blogData);
  return response.data;
}

export async function list_favourites() {
  const url = `/favourites/`;
  const response = await axiosWithAuth.get(url);
  return response.data;
}

export async function deleteComment(blogId, commentId) {
  const url = `/blog/${blogId}/comments/${commentId}/`;
  const response = await axiosWithAuth.delete(url);
  return response.data;
}

  