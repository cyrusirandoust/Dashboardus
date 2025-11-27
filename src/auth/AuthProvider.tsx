/**
 * Authentication Provider Component
 * 
 * Provides authentication context to the entire application using MSAL.
 * Wraps the app with MsalProvider and manages authentication state.
 * 
 * Security Notes:
 * - Uses MSAL redirect flow (most secure for production)
 * - Tokens stored in sessionStorage (cleared on tab close)
 * - No client secrets (delegated permissions only)
 * - Automatic token refresh via MSAL
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { MsalProvider, useMsal, useIsAuthenticated } from '@azure/msal-react';
import { AccountInfo, InteractionRequiredAuthError, InteractionStatus } from '@azure/msal-browser';
import { msalInstance, initializeMsal, setupMsalEventCallbacks } from './msalInstance';
import { loginRequest, tokenRequest } from './msalConfig';

// ============================================================================
// Types
// ============================================================================

interface AuthContextType {
  isAuthenticated: boolean;
  account: AccountInfo | null;
  isLoading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  acquireToken: (scopes?: string[]) => Promise<string>;
}

// ============================================================================
// Context
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// Auth Provider Implementation
// ============================================================================

/**
 * Internal auth provider that uses MSAL hooks.
 * This component must be wrapped by MsalProvider.
 */
function AuthProviderInternal({ children }: { children: React.ReactNode }) {
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get the active account
  const account = accounts[0] || null;

  /**
   * Initialize authentication on mount
   */
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // MSAL is already initialized by the time this runs
        // Just check if we have an active account
        if (accounts.length > 0) {
          instance.setActiveAccount(accounts[0]);
          console.info('[Auth] Active account loaded:', accounts[0].username);
        }
      } catch (err) {
        console.error('[Auth] Initialization error:', err);
        setError('Failed to initialize authentication');
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [instance, accounts]);

  /**
   * Handle login using redirect flow
   */
  const login = useCallback(async () => {
    try {
      setError(null);
      console.info('[Auth] Initiating login redirect...');
      
      // Use redirect flow (more secure than popup)
      await instance.loginRedirect(loginRequest);
      
      // Note: This code won't execute because redirect navigates away
      // The redirect response is handled in msalInstance.ts
    } catch (err: any) {
      console.error('[Auth] Login error:', err);
      setError(err.message || 'Login failed');
      throw err;
    }
  }, [instance]);

  /**
   * Handle logout
   */
  const logout = useCallback(async () => {
    try {
      setError(null);
      console.info('[Auth] Logging out...');
      
      // Logout with redirect
      await instance.logoutRedirect({
        account: account || undefined,
      });
      
      // Note: This code won't execute because redirect navigates away
    } catch (err: any) {
      console.error('[Auth] Logout error:', err);
      setError(err.message || 'Logout failed');
      throw err;
    }
  }, [instance, account]);

  /**
   * Acquire access token for Microsoft Graph API calls
   * 
   * This function:
   * 1. Attempts silent token acquisition first (uses cached tokens)
   * 2. Falls back to interactive consent if silent fails
   * 3. Returns the access token for API calls
   * 
   * @param scopes - Optional array of scopes (defaults to all required scopes)
   * @returns Access token string
   */
  const acquireToken = useCallback(async (scopes?: string[]): Promise<string> => {
    if (!account) {
      throw new Error('No active account. Please sign in.');
    }

    const requestScopes = scopes || tokenRequest.scopes;

    try {
      // Try silent token acquisition first
      const response = await instance.acquireTokenSilent({
        scopes: requestScopes,
        account: account,
        forceRefresh: false,
      });

      console.debug('[Auth] Token acquired silently');
      return response.accessToken;
    } catch (error) {
      // Silent acquisition failed
      if (error instanceof InteractionRequiredAuthError) {
        console.warn('[Auth] Silent token acquisition failed, requiring interaction');
        
        try {
          // Fall back to interactive token acquisition via redirect
          await instance.acquireTokenRedirect({
            scopes: requestScopes,
            account: account,
          });
          
          // This code won't execute because redirect navigates away
          // The token will be available after redirect completes
          throw new Error('Redirect in progress');
        } catch (redirectError: any) {
          console.error('[Auth] Interactive token acquisition failed:', redirectError);
          throw redirectError;
        }
      } else {
        console.error('[Auth] Token acquisition error:', error);
        throw error;
      }
    }
  }, [instance, account]);

  // Context value
  const value: AuthContextType = {
    isAuthenticated,
    account,
    isLoading: isLoading || inProgress !== InteractionStatus.None,
    error,
    login,
    logout,
    acquireToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================================
// Main Auth Provider (with MSAL Provider wrapper)
// ============================================================================

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Main authentication provider component.
 * Wraps the app with MsalProvider and custom AuthContext.
 * 
 * Usage:
 * ```tsx
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * ```
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [msalInitialized, setMsalInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await initializeMsal();
        setupMsalEventCallbacks();
        setMsalInitialized(true);
        console.info('[Auth] MSAL initialized successfully');
      } catch (error: any) {
        console.error('[Auth] MSAL initialization failed:', error);
        setInitError(error.message || 'Failed to initialize authentication');
      }
    };

    init();
  }, []);

  // Show loading state while MSAL initializes
  if (!msalInitialized) {
    if (initError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Authentication Error</h1>
            <p className="text-text-secondary">{initError}</p>
            <p className="text-text-muted text-sm mt-4">
              Please check your environment configuration and try again.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-text-secondary">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <MsalProvider instance={msalInstance}>
      <AuthProviderInternal>
        {children}
      </AuthProviderInternal>
    </MsalProvider>
  );
}

// ============================================================================
// Custom Hook
// ============================================================================

/**
 * Custom hook to access authentication context.
 * 
 * Usage:
 * ```tsx
 * const { isAuthenticated, account, login, logout, acquireToken } = useAuth();
 * ```
 * 
 * @throws Error if used outside AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// ============================================================================
// Export
// ============================================================================

export default AuthProvider;

// Made with Bob
