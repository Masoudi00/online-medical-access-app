// Token management utilities
export const setToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};

// Auth state management
export const isAuthenticated = () => {
  return !!getToken();
};

// API request helper with auth header
export const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  
  const headers = {
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  // Handle 401 Unauthorized
  if (response.status === 401) {
    removeToken();
    window.location.href = '/login';
    return;
  }
  
  return response;
}; 