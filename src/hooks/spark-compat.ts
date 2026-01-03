/**
 * Compatibility shim for @github/spark hooks
 * This module provides drop-in replacements for GitHub Spark hooks
 * that work with our local API backend instead
 */

import { useApiState } from './useApiState';

/**
 * Drop-in replacement for useKV from @github/spark/hooks
 * Maintains the same interface but uses our backend API
 */
export function useKV<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  return useApiState(key, defaultValue);
}

// Mock window.spark for components that check for owner status
if (typeof window !== 'undefined') {
  (window as any).spark = {
    user: async () => {
      // Check if there's an admin session
      // For now, we'll use sessionStorage to track admin login
      const adminUser = sessionStorage.getItem('adminUser');
      
      if (adminUser) {
        return {
          isOwner: true,
          username: adminUser
        };
      }
      
      return {
        isOwner: false
      };
    }
  };
}
