import { authFetch } from './auth';

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
    return authFetch(url, options);
}

export const updateUserSettings = async (settings: { language: string; theme?: string }) => {
  try {
    const response = await authFetch('http://localhost:8000/settings/language', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });

    if (!response?.ok) {
      throw new Error('Failed to update settings');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
};