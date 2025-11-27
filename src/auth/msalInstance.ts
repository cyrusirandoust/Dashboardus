/**
 * MSAL Instance Initialization
 * 
 * Creates and exports a singleton MSAL PublicClientApplication instance
 * that will be used throughout the application for authentication.
 */

import { PublicClientApplication, EventType, EventMessage, AuthenticationResult } from '@azure/msal-browser';
import { msalConfig } from './msalConfig';

/**
 * Initialize MSAL instance with configuration.
 * This is a singleton - only one instance exists for the entire application.
 */
export const msalInstance = new PublicClientApplication(msalConfig);

/**
 * Initialize MSAL and handle redirect promise.
 * This must be called before any authentication operations.
 * 
 * The redirect promise handles the response from Azure AD after a redirect.
 * If the user is returning from a login redirect, this will process the response.
 */
export async function initializeMsal(): Promise<void> {
  try {
    // Handle redirect promise - this processes the auth response after redirect
    await msalInstance.initialize();
    const response = await msalInstance.handleRedirectPromise();
    
    if (response) {
      // User has successfully authenticated via redirect
      console.info('[MSAL] Authentication successful via redirect');
      
      // Set the active account
      if (response.account) {
        msalInstance.setActiveAccount(response.account);
      }
    } else {
      // No redirect response - check if there's an active account in cache
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        // Set the first account as active
        msalInstance.setActiveAccount(accounts[0]);
        console.info('[MSAL] Active account loaded from cache');
      }
    }
  } catch (error) {
    console.error('[MSAL] Error during initialization:', error);
    throw error;
  }
}

/**
 * Set up MSAL event callbacks.
 * These callbacks handle various authentication events.
 */
export function setupMsalEventCallbacks(): void {
  // Register event callbacks
  msalInstance.addEventCallback((event: EventMessage) => {
    switch (event.eventType) {
      case EventType.LOGIN_SUCCESS:
        console.info('[MSAL Event] Login success');
        if (event.payload) {
          const payload = event.payload as AuthenticationResult;
          if (payload.account) {
            msalInstance.setActiveAccount(payload.account);
          }
        }
        break;

      case EventType.LOGIN_FAILURE:
        console.error('[MSAL Event] Login failure:', event.error);
        break;

      case EventType.ACQUIRE_TOKEN_SUCCESS:
        console.debug('[MSAL Event] Token acquired successfully');
        break;

      case EventType.ACQUIRE_TOKEN_FAILURE:
        console.error('[MSAL Event] Token acquisition failure:', event.error);
        break;

      case EventType.LOGOUT_SUCCESS:
        console.info('[MSAL Event] Logout success');
        break;

      case EventType.ACCOUNT_ADDED:
        console.info('[MSAL Event] Account added');
        break;

      case EventType.ACCOUNT_REMOVED:
        console.info('[MSAL Event] Account removed');
        break;

      default:
        // Ignore other events
        break;
    }
  });
}

/**
 * Get the currently active account.
 * Returns null if no account is active.
 */
export function getActiveAccount() {
  return msalInstance.getActiveAccount();
}

/**
 * Check if user is authenticated.
 * Returns true if there's an active account.
 */
export function isAuthenticated(): boolean {
  const account = msalInstance.getActiveAccount();
  return account !== null;
}

// Made with Bob
