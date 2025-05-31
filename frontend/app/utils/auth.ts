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

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// API request helper with auth header
export const authFetch = async (url: string, options: RequestInit = {}, retries = 2) => {
  const token = getToken();
  
  if (!token) {
    console.error('No token found');
    removeToken();
    window.location.href = '/login';
    return;
  }

  for (let i = 0; i <= retries; i++) {
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      };

      console.log('Making request to:', url);
      console.log('With headers:', headers);

      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log('Response status:', response.status);

      // Handle 401 Unauthorized
      if (response.status === 401) {
        console.error('Unauthorized request');
        removeToken();
        window.location.href = '/login';
        return;
      }

      // Handle other error statuses
      if (!response.ok) {
        console.error('Request failed:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.error('Error data:', errorData);
        throw new Error(errorData.detail || `Request failed with status ${response.status}`);
      }

      return response;
    } catch (error) {
      console.error(`Fetch error (attempt ${i + 1}/${retries + 1}):`, error);
      
      // If this was our last retry, throw the error
      if (i === retries) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      await delay(Math.pow(2, i) * 1000);
    }
  }
}; 