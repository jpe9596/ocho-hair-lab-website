import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Map of KV keys to API endpoints
const KEY_TO_ENDPOINT_MAP: Record<string, string> = {
  'appointments': '/appointments',
  'customer-accounts': '/customer-accounts',
  'staff-members': '/staff-members',
  'salon-services': '/salon-services',
  'staff-schedules': '/staff-schedules',
  'sms-logs': '/sms-logs'
};

interface UseApiStateResult<T> {
  data: T;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to replace useKV from @github/spark
 * Fetches data from our backend API and provides similar interface
 */
export function useApiState<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [data, setData] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const endpoint = KEY_TO_ENDPOINT_MAP[key];
  
  if (!endpoint) {
    console.error(`No API endpoint mapped for key: ${key}`);
  }

  // Fetch data from API
  const fetchData = useCallback(async () => {
    if (!endpoint) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${key}: ${response.statusText}`);
      }
      
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      console.error(`Error fetching ${key}:`, err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      // Keep default value on error
    } finally {
      setLoading(false);
    }
  }, [key, endpoint]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Setter function that updates local state and syncs with API
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setData(prevData => {
      const newData = typeof value === 'function' ? (value as (prev: T) => T)(prevData) : value;
      
      // Sync with API in the background (fire and forget for now)
      // Note: Individual components should handle their own POST/PUT/DELETE operations
      // This is just for optimistic updates
      
      return newData;
    });
  }, []);

  return [data, setValue];
}

// Helper function for API calls
export async function apiCall(method: string, endpoint: string, data?: any) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error: ${response.status} - ${errorText}`);
  }
  
  if (method === 'DELETE' || response.status === 204) {
    return null;
  }
  
  return response.json();
}

// Export API helpers for direct operations
export const api = {
  get: (endpoint: string) => apiCall('GET', endpoint),
  post: (endpoint: string, data: any) => apiCall('POST', endpoint, data),
  put: (endpoint: string, data: any) => apiCall('PUT', endpoint, data),
  delete: (endpoint: string) => apiCall('DELETE', endpoint),
};
