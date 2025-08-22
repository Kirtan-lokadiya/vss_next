export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5321';

export const ENDPOINTS = {
  postBase: `${BASE_URL}/api/v1/posts`,
  feedBase: `${BASE_URL}/api/v1/feed`,
  userBase: `${BASE_URL}/api/v1/users`,
  connectBase: `${BASE_URL}/api/v1/connect`,
  notificationBase: `${BASE_URL}/api/v1/notification/`,
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

const getJsonSafe = async (res) => {
  try { return await res.json(); } catch { return null; }
};

const ensureOk = (res, data) => {
  // Treat 200 with { errors: { message } } as failure
  const apiErrorMessage = data?.errors?.message || data?.message;
  const hasErrors = !!data?.errors || (typeof data?.customCode === 'number' && data?.customCode !== 0);
  if (!res.ok || hasErrors) {
    const message = apiErrorMessage || 'Request failed';
    const error = new Error(message);
    error.api = data;
    throw error;
  }
};

export const createIdea = async ({ userId, idea, token }) => {
  const res = await fetch(`${ENDPOINTS.postBase}/idea`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ userId, idea }),
  });
  const data = await getJsonSafe(res);
  ensureOk(res, data);
  return data;
};

export const fetchFeed = async ({ page = 1, token }) => {
  const res = await fetch(`${ENDPOINTS.feedBase}/?page=${encodeURIComponent(page)}`, {
    headers: authHeaders(token),
  });
  const data = await getJsonSafe(res);
  ensureOk(res, data);
  return data;
};

export const fetchUserLiked = async ({ token }) => {
  const res = await fetch(`${ENDPOINTS.postBase}/user/liked`, {
    headers: authHeaders(token),
  });
  const data = await getJsonSafe(res);
  ensureOk(res, data);
  return data;
};

export const fetchUserSaved = async ({ token }) => {
  const res = await fetch(`${ENDPOINTS.postBase}/user/saved`, {
    headers: authHeaders(token),
  });
  const data = await getJsonSafe(res);
  ensureOk(res, data);
  return data;
};

export const toggleLikePost = async ({ postId, token }) => {
  const res = await fetch(`${ENDPOINTS.postBase}/like?postId=${encodeURIComponent(postId)}`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  const data = await getJsonSafe(res);
  ensureOk(res, data);
  return true;
};

export const toggleSavePost = async ({ postId, token }) => {
  const res = await fetch(`${ENDPOINTS.postBase}/save?postId=${encodeURIComponent(postId)}`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  const data = await getJsonSafe(res);
  ensureOk(res, data);
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
  const ui = {
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
  // Extract hashtags from content
  try {
    const text = ui.content || '';
    const matches = text.match(/#([\p{L}0-9_]+)/gu) || [];
    ui.hashtags = Array.from(new Set(matches.map(m => m.replace(/^#/, '').toLowerCase())));
  } catch {}
  return ui;
};

// User profile APIs
export const fetchUserBasic = async ({ userId, token }) => {
  const res = await fetch(`${ENDPOINTS.userBase}/${encodeURIComponent(userId)}`, {
    headers: authHeaders(token),
  });
  const data = await getJsonSafe(res);
  ensureOk(res, data);
  return data;
};

// Post graph API
export const fetchPostGraph = async ({ postId, token }) => {
  const res = await fetch(`${ENDPOINTS.postBase}/graph/${encodeURIComponent(postId)}`, {
    headers: authHeaders(token),
  });
  const data = await getJsonSafe(res);
  ensureOk(res, data);
  return data; // expected shape: { users: [{ id, name, picture }] }
};

export const fetchUserProfile = async ({ userId, token }) => {
  const res = await fetch(`${ENDPOINTS.userBase}/profile/${encodeURIComponent(userId)}`, {
    headers: authHeaders(token),
  });
  const data = await getJsonSafe(res);
  ensureOk(res, data);
  return data;
};

export const updateUserProfile = async ({ profile, token }) => {
  const res = await fetch(`${ENDPOINTS.userBase}/profile`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(profile),
  });
  const data = await getJsonSafe(res);
  ensureOk(res, data);
  return data;
};

// --- Connection APIs ---
export const getConnectionStatus = async ({ targetUserId, token }) => {
  const res = await fetch(`${ENDPOINTS.connectBase}/status/${encodeURIComponent(targetUserId)}`, {
    headers: authHeaders(token),
  });
  const data = await getJsonSafe(res);
  ensureOk(res, data ?? {});
  return data; // e.g., "NOT_SEND", "PENDING", "REJECTED", "CONNECT"
};

export const sendConnectionRequest = async ({ targetUserId, message, token }) => {
  const res = await fetch(`${ENDPOINTS.connectBase}/request`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ targetUserId, message }),
  });
  const data = await getJsonSafe(res);
  ensureOk(res, data ?? {});
  return true;
};

export const acceptConnection = async ({ targetUserId, token }) => {
  const res = await fetch(`${ENDPOINTS.connectBase}/accept`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ targetUserId }),
  });
  const data = await getJsonSafe(res);
  ensureOk(res, data ?? {});
  return true;
};

export const cancelConnection = async ({ targetUserId, token }) => {
  const res = await fetch(`${ENDPOINTS.connectBase}/cancel`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ targetUserId }),
  });
  const data = await getJsonSafe(res);
  ensureOk(res, data ?? {});
  return true;
};

export const rejectConnection = async ({ targetUserId, token }) => {
  const res = await fetch(`${ENDPOINTS.connectBase}/reject`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ targetUserId }),
  });
  const data = await getJsonSafe(res);
  ensureOk(res, data ?? {});
  return true;
};

export const deleteConnection = async ({ targetUserId, token }) => {
  const res = await fetch(`${ENDPOINTS.connectBase}/delete`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ targetUserId }),
  });
  const data = await getJsonSafe(res);
  ensureOk(res, data ?? {});
  return true;
};

export const getConnectionCount = async ({ userId, token }) => {
  const res = await fetch(`${ENDPOINTS.connectBase}/count/${encodeURIComponent(userId)}`, {
    headers: authHeaders(token),
  });
  // Endpoint returns number (not JSON)
  const text = await res.text();
  if (!res.ok) throw new Error(text || 'Failed to fetch connection count');
  const num = Number(text);
  return Number.isNaN(num) ? 0 : num;
};

// --- Notifications API ---
export const fetchNotifications = async ({ token }) => {
  const res = await fetch(`${ENDPOINTS.notificationBase}`, {
    headers: authHeaders(token),
  });
  const data = await getJsonSafe(res);
  ensureOk(res, data ?? {});
  return Array.isArray(data) ? data : [];
};