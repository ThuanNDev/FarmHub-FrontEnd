'use client';

import { useState, useEffect } from 'react';
import { getMe } from '@/services/api';
import type { User } from '@/types';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      try {
        const userData = await getMe();
        setUser(userData);
      } catch (error) {
        console.error("Authentication failed:", error);
        setUser(null);
        // Clear invalid token
        localStorage.removeItem('accessToken');
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();
  }, []);

  return { user, isLoading };
}
