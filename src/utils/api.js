export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5321';

export const ENDPOINTS = {
  postBase: `${BASE_URL}/api/v1/posts`,
  feedBase: `${BASE_URL}/api/v1/feed`,
};

export const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
};

export const authHeaders = (token) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

export const createIdea = async ({ userId, idea, token }) => {
  const res = await fetch(`${ENDPOINTS.postBase}/idea`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ userId, idea }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = data?.message || 'Failed to create idea';
    throw new Error(message);
  }
  return data;
};

export const fetchFeed = async ({ page = 1, token }) => {
  const res = await fetch(`${ENDPOINTS.feedBase}/?page=${encodeURIComponent(page)}`, {
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) {
    const message = data?.message || 'Failed to load feed';
    throw new Error(message);
  }
  return data;
};

export const fetchUserLiked = async ({ token }) => {
  const res = await fetch(`${ENDPOINTS.postBase}/user/liked`, {
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Failed to load liked posts');
  return data;
};

export const fetchUserSaved = async ({ token }) => {
  const res = await fetch(`${ENDPOINTS.postBase}/user/saved`, {
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Failed to load saved posts');
  return data;
};

export const toggleLikePost = async ({ postId, token }) => {
  const res = await fetch(`${ENDPOINTS.postBase}/like?postId=${encodeURIComponent(postId)}`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  if (!res.ok) {
    let data = null;
    try { data = await res.json(); } catch {}
    throw new Error(data?.message || 'Failed to like post');
  }
  return true;
};

export const toggleSavePost = async ({ postId, token }) => {
  const res = await fetch(`${ENDPOINTS.postBase}/save?postId=${encodeURIComponent(postId)}`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  if (!res.ok) {
    let data = null;
    try { data = await res.json(); } catch {}
    throw new Error(data?.message || 'Failed to save post');
  }
  return true;
};

// Helpers to map backend post shape to UI post shape used by Feed components
export const mapApiPostToUI = (apiPost) => {
  // api shape fields example:
  // { id, content, type: 'IDEA', title, user: { name, id, picture }, createAt: [yyyy, m, d, h, min, s, ns], commentCount, likeCount, save, like }
  const createdAt = Array.isArray(apiPost?.createAt)
    ? new Date(
        apiPost.createAt[0] || 1970,
        (apiPost.createAt[1] || 1) - 1,
        apiPost.createAt[2] || 1,
        apiPost.createAt[3] || 0,
        apiPost.createAt[4] || 0,
        apiPost.createAt[5] || 0
      )
    : new Date();
  const author = {
    name: apiPost?.user?.name || 'User',
    title: '',
    company: '',
    avatar: apiPost?.user?.picture && apiPost.user.picture !== 'None' ? apiPost.user.picture : null,
  };
  const typeLower = (apiPost?.type || 'thought').toString().toLowerCase();
  return {
    id: apiPost?.id,
    type: typeLower,
    author,
    content: apiPost?.content || apiPost?.idea || '',
    timestamp: createdAt,
    likes: apiPost?.likeCount || 0,
    comments: apiPost?.commentCount || 0,
    shares: apiPost?.shareCount || 0,
    views: apiPost?.viewCount || 0,
    isLiked: !!apiPost?.like,
    isSaved: !!apiPost?.save,
    hashtags: [],
  };
};