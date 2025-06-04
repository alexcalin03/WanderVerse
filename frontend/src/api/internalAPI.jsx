import axios from 'axios';
const API_BASE = 'http://127.0.0.1:8000';
const TOKEN = localStorage.getItem('authToken');

axios.defaults.baseURL = API_BASE;
axios.defaults.headers.common['Authorization'] = `Token ${TOKEN}`;
axios.defaults.headers.common['Content-Type'] = 'application/json';

const cache = {};

export async function fetchBlogsPage(page = 1, perPage = 15) {
  const cacheKey = `blogs?page=${page}&per_page=${perPage}`;
  if (cache[cacheKey]) {
    return cache[cacheKey];
  }
  const url = `/blogs/?page=${page}&per_page=${perPage}`;
  const response = await axios.get(url);
  const data = response.data;
  cache[cacheKey] = data;
  return data;
}

export async function increment_likes(blog_id) {
  const url = `/blog/${blog_id}/likes/`;
  await axios.post(url);
}

export async function increment_reads(blog_id) {
  const url = `/blog/${blog_id}/reads/`;
  await axios.post(url);
}

export async function decrement_likes(blog_id) {
  const url = `/blog/${blog_id}/likes/`;
  await axios.delete(url);
}

export async function fetchBlog(blog_id) {
  const url = `/blog/${blog_id}/`;
  const response = await axios.get(url);
  return response.data;
}
  