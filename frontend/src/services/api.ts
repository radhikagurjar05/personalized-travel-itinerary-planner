import { ItineraryData, SavedItinerary, TripFormInputs, User } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '') || 
  (import.meta.env.DEV ? 'http://localhost:5000' : '');

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('tripgenius_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    let errorMsg = data.message || data.error || `Request failed with status ${res.status}`;
    if (data.details && Array.isArray(data.details)) {
      const fieldErrors = data.details.map((d: any) => `${d.field ? d.field + ': ' : ''}${d.message}`).join(', ');
      errorMsg = `${errorMsg}: ${fieldErrors}`;
    }
    throw new Error(errorMsg);
  }
  return data as T;
}

export const api = {
  async health(): Promise<{ status: string; service: string; database: string }> {
    const res = await fetch(`${API_BASE_URL}/api/health`);
    return handleResponse(res);
  },

  async generateItinerary(payload: TripFormInputs): Promise<{ success: boolean; destination: string; data: ItineraryData }> {
    const res = await fetch(`${API_BASE_URL}/api/itineraries/generate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async refineItinerary(
    currentItinerary: ItineraryData,
    refinementPrompt: string,
    itineraryId?: string,
    originalRequest?: any
  ): Promise<{ success: boolean; data: ItineraryData }> {
    const res = await fetch(`${API_BASE_URL}/api/itineraries/refine`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        itinerary_id: itineraryId,
        current_itinerary: currentItinerary,
        refinement_prompt: refinementPrompt,
        original_request: originalRequest,
      }),
    });
    return handleResponse(res);
  },

  async listItineraries(): Promise<{ count: number; itineraries: SavedItinerary[] }> {
    const res = await fetch(`${API_BASE_URL}/api/itineraries`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getItinerary(id: string): Promise<{ success: boolean; itinerary: SavedItinerary }> {
    const res = await fetch(`${API_BASE_URL}/api/itineraries/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async saveItinerary(
    itinerary: {
      title: string;
      destination: string;
      starting_city?: string | null;
      start_date: string;
      end_date: string;
      duration_days: number;
      travelers_count: number;
      budget: number;
      currency: string;
      travel_pace: string;
      interests?: string[];
      preferences?: Record<string, any>;
      itinerary_data: ItineraryData;
    }
  ): Promise<{ message: string; itinerary: SavedItinerary }> {
    const res = await fetch(`${API_BASE_URL}/api/itineraries`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(itinerary),
    });
    return handleResponse(res);
  },

  async updateItinerary(
    id: string,
    updates: { title?: string; itinerary_data?: ItineraryData }
  ): Promise<{ message: string; itinerary: SavedItinerary }> {
    const res = await fetch(`${API_BASE_URL}/api/itineraries/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(res);
  },

  async deleteItinerary(id: string): Promise<{ message: string; id: string }> {
    const res = await fetch(`${API_BASE_URL}/api/itineraries/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async register(name: string, email: string, password: string): Promise<{ message: string; token: string; user: User }> {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await handleResponse<{ message: string; token: string; user: User }>(res);
    localStorage.setItem('tripgenius_token', data.token);
    localStorage.setItem('tripgenius_user', JSON.stringify(data.user));
    return data;
  },

  async login(email: string, password: string): Promise<{ message: string; token: string; user: User }> {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await handleResponse<{ message: string; token: string; user: User }>(res);
    localStorage.setItem('tripgenius_token', data.token);
    localStorage.setItem('tripgenius_user', JSON.stringify(data.user));
    return data;
  },

  async getMe(): Promise<{ authenticated: boolean; user: User | null }> {
    const token = localStorage.getItem('tripgenius_token');
    if (!token) {
      return { authenticated: false, user: null };
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: getHeaders(),
      });
      return await handleResponse(res);
    } catch {
      localStorage.removeItem('tripgenius_token');
      localStorage.removeItem('tripgenius_user');
      return { authenticated: false, user: null };
    }
  },

  logout() {
    localStorage.removeItem('tripgenius_token');
    localStorage.removeItem('tripgenius_user');
  }
};
