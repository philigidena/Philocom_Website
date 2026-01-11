/**
 * Authentication Context for Admin Panel
 * Uses AWS Cognito for authentication
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
} from 'amazon-cognito-identity-js';

const AuthContext = createContext(null);

// Cognito configuration from environment
const poolData = {
  UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || '',
  ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '',
};

const userPool = poolData.UserPoolId && poolData.ClientId
  ? new CognitoUserPool(poolData)
  : null;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = useCallback(() => {
    if (!userPool) {
      setIsLoading(false);
      return;
    }

    const cognitoUser = userPool.getCurrentUser();

    if (cognitoUser) {
      cognitoUser.getSession((err, session) => {
        if (err) {
          console.error('Session error:', err);
          setUser(null);
        } else if (session.isValid()) {
          cognitoUser.getUserAttributes((err, attributes) => {
            if (err) {
              console.error('Get attributes error:', err);
              setUser({ email: cognitoUser.getUsername() });
            } else {
              const userAttrs = {};
              attributes.forEach((attr) => {
                userAttrs[attr.getName()] = attr.getValue();
              });
              setUser({
                email: userAttrs.email || cognitoUser.getUsername(),
                name: userAttrs.name || 'Admin',
                ...userAttrs,
              });
            }
            setIsLoading(false);
          });
        } else {
          setUser(null);
          setIsLoading(false);
        }
      });
    } else {
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    if (!userPool) {
      throw new Error('Authentication not configured');
    }

    setError(null);
    setIsLoading(true);

    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      const authDetails = new AuthenticationDetails({
        Username: email,
        Password: password,
      });

      cognitoUser.authenticateUser(authDetails, {
        onSuccess: (result) => {
          cognitoUser.getUserAttributes((err, attributes) => {
            if (err) {
              setUser({ email });
            } else {
              const userAttrs = {};
              attributes.forEach((attr) => {
                userAttrs[attr.getName()] = attr.getValue();
              });
              setUser({
                email: userAttrs.email || email,
                name: userAttrs.name || 'Admin',
                ...userAttrs,
              });
            }
            setIsLoading(false);
            resolve(result);
          });
        },
        onFailure: (err) => {
          console.error('Login error:', err);
          setError(err.message || 'Login failed');
          setIsLoading(false);
          reject(err);
        },
        newPasswordRequired: (userAttributes, requiredAttributes) => {
          // Handle new password required (first login)
          setIsLoading(false);
          reject({
            code: 'NewPasswordRequired',
            message: 'New password required',
            cognitoUser,
            userAttributes,
          });
        },
      });
    });
  }, []);

  const completeNewPassword = useCallback(async (cognitoUser, newPassword) => {
    setError(null);
    setIsLoading(true);

    return new Promise((resolve, reject) => {
      cognitoUser.completeNewPasswordChallenge(newPassword, {}, {
        onSuccess: (result) => {
          checkAuthState();
          resolve(result);
        },
        onFailure: (err) => {
          console.error('Complete password error:', err);
          setError(err.message || 'Failed to set new password');
          setIsLoading(false);
          reject(err);
        },
      });
    });
  }, [checkAuthState]);

  const logout = useCallback(() => {
    if (!userPool) return;

    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
    }
    setUser(null);
  }, []);

  const getIdToken = useCallback(() => {
    if (!userPool) return Promise.resolve(null);

    return new Promise((resolve, reject) => {
      const cognitoUser = userPool.getCurrentUser();
      if (!cognitoUser) {
        resolve(null);
        return;
      }

      cognitoUser.getSession((err, session) => {
        if (err) {
          reject(err);
        } else if (session.isValid()) {
          resolve(session.getIdToken().getJwtToken());
        } else {
          resolve(null);
        }
      });
    });
  }, []);

  const value = {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    completeNewPassword,
    getIdToken,
    checkAuthState,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
