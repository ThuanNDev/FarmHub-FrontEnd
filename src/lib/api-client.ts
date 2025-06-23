'use client';

/**
 * @fileoverview A centralized API client for making authenticated requests.
 * This client automatically attaches the JWT token to requests and handles
 * the standard API response format.
 */

// This function should only be called from the client side.
export async function apiClient<T>(url: string, options: RequestInit = {}): Promise<T> {
  if (typeof window === 'undefined') {
    // This should not happen if called from client components, but as a safeguard.
    throw new Error('apiClient can only be called on the client side.');
  }

  const token = localStorage.getItem('accessToken');

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type')) {
    headers.append('Content-Type', 'application/json');
  }

  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle responses with no content (e.g., DELETE requests)
  if (response.status === 204) {
    return null as T;
  }

  const responseData = await response.json();

  if (!response.ok) {
    // Use the message from the API response if available, otherwise use the status text
    const errorMessage = responseData.message || response.statusText || 'An unknown API error occurred';
    throw new Error(errorMessage);
  }

  // The API wraps the actual data in a `data` property.
  // If `data` property doesn't exist, return the whole response.
  return 'data' in responseData ? responseData.data : responseData;
}
