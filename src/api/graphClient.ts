/**
 * Microsoft Graph Client Factory
 * 
 * Creates and configures Microsoft Graph client instances with proper
 * authentication and error handling.
 */

import { Client, ClientOptions, GraphError } from '@microsoft/microsoft-graph-client';
import { useAuth } from '@/auth/AuthProvider';

/**
 * Create a Microsoft Graph client with authentication.
 * 
 * @param getToken - Function to acquire access token
 * @returns Configured Graph client
 */
export function createGraphClient(getToken: () => Promise<string>): Client {
  const clientOptions: ClientOptions = {
    authProvider: {
      getAccessToken: async () => {
        try {
          const token = await getToken();
          return token;
        } catch (error) {
          console.error('[GraphClient] Failed to acquire token:', error);
          throw error;
        }
      },
    },
    defaultVersion: 'v1.0', // Set default version since paths don't include it
  };

  return Client.initWithMiddleware(clientOptions);
}

/**
 * Custom hook to get an authenticated Graph client.
 * 
 * Usage:
 * ```tsx
 * const graphClient = useGraphClient();
 * const data = await graphClient.api('/me').get();
 * ```
 */
export function useGraphClient() {
  const { acquireToken } = useAuth();

  return createGraphClient(() => acquireToken());
}

/**
 * Handle Graph API errors and convert to user-friendly messages.
 * 
 * @param error - Error from Graph API
 * @returns User-friendly error message
 */
export function handleGraphError(error: any): string {
  if (error instanceof GraphError) {
    const statusCode = error.statusCode;
    const message = error.message;

    switch (statusCode) {
      case 401:
        return 'Authentication failed. Please sign in again.';
      case 403:
        return 'You don\'t have permission to access this resource. Please contact your administrator.';
      case 404:
        return 'The requested resource was not found.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
      case 503:
        return 'Microsoft Graph service is temporarily unavailable. Please try again later.';
      default:
        return message || 'An error occurred while accessing Microsoft Graph.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unknown error occurred.';
}

/**
 * Retry a Graph API call with exponential backoff.
 * 
 * @param fn - Function to retry
 * @param maxRetries - Maximum number of retries
 * @param initialDelay - Initial delay in milliseconds
 * @returns Result of the function
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Don't retry on 4xx errors (except 429)
      if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500 && error.statusCode !== 429) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = initialDelay * Math.pow(2, i);
      console.warn(`[GraphClient] Retry ${i + 1}/${maxRetries} after ${delay}ms`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

export default {
  createGraphClient,
  useGraphClient,
  handleGraphError,
  retryWithBackoff,
};

// Made with Bob
