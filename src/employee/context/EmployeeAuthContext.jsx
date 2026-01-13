/**
 * Authentication Context for Employee Panel
 * Uses AWS Cognito for authentication (employees group)
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
} from 'amazon-cognito-identity-js';

const EmployeeAuthContext = createContext(null);

// Cognito configuration from environment (same pool as admin)
// Fallback to hardcoded values for production
const poolData = {
  UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || 'eu-central-1_eSUvnW76G',
  ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '1t4c2ju4qme96kfr2d6qa7rh1s',
};

const userPool = poolData.UserPoolId && poolData.ClientId
  ? new CognitoUserPool(poolData)
  : null;

// Fallback credentials for development when Cognito is not configured
const FALLBACK_CREDENTIALS = {
  email: 'employee@philocom.co',
  password: 'Employee2024!',
};

export function EmployeeAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = useCallback(() => {
    // Check fallback localStorage auth first
    if (!userPool) {
      const storedUser = localStorage.getItem('philocom_employee_user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setEmployee({
            email: userData.assignedEmail || 'john@philocom.co',
            name: userData.name || 'Employee',
          });
        } catch (e) {
          localStorage.removeItem('philocom_employee_user');
        }
      }
      setIsLoading(false);
      return;
    }

    const cognitoUser = userPool.getCurrentUser();

    if (cognitoUser) {
      cognitoUser.getSession((err, session) => {
        if (err) {
          console.error('Session error:', err);
          setUser(null);
          setEmployee(null);
          setIsLoading(false);
        } else if (session.isValid()) {
          cognitoUser.getUserAttributes((err, attributes) => {
            if (err) {
              console.error('Get attributes error:', err);
              setUser({ email: cognitoUser.getUsername() });
              setIsLoading(false);
            } else {
              const userAttrs = {};
              attributes.forEach((attr) => {
                userAttrs[attr.getName()] = attr.getValue();
              });

              // Check if user is in employees group
              const groups = userAttrs['cognito:groups'] || '';
              const groupList = Array.isArray(groups) ? groups : groups.split(',');

              if (!groupList.includes('employees')) {
                // Not an employee - logout
                cognitoUser.signOut();
                setUser(null);
                setEmployee(null);
                setError('You do not have access to the employee panel');
                setIsLoading(false);
                return;
              }

              const userData = {
                email: userAttrs.email || cognitoUser.getUsername(),
                name: userAttrs.name || 'Employee',
                assignedEmail: userAttrs['custom:assigned_email'],
                ...userAttrs,
              };

              setUser(userData);
              setEmployee({
                email: userData.assignedEmail,
                name: userData.name,
                loginEmail: userData.email,
              });
              setIsLoading(false);
            }
          });
        } else {
          setUser(null);
          setEmployee(null);
          setIsLoading(false);
        }
      });
    } else {
      setUser(null);
      setEmployee(null);
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    setIsLoading(true);

    // Fallback authentication when Cognito is not configured
    if (!userPool) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (email === FALLBACK_CREDENTIALS.email && password === FALLBACK_CREDENTIALS.password) {
            const userData = {
              email,
              name: 'John Doe',
              assignedEmail: 'john@philocom.co',
            };
            setUser(userData);
            setEmployee({
              email: userData.assignedEmail,
              name: userData.name,
              loginEmail: email,
            });
            localStorage.setItem('philocom_employee_user', JSON.stringify(userData));
            setIsLoading(false);
            resolve({ success: true });
          } else {
            setError('Invalid email or password');
            setIsLoading(false);
            reject(new Error('Invalid email or password'));
          }
        }, 500);
      });
    }

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
              setIsLoading(false);
              resolve(result);
            } else {
              const userAttrs = {};
              attributes.forEach((attr) => {
                userAttrs[attr.getName()] = attr.getValue();
              });

              // Check if user is in employees group
              const groups = userAttrs['cognito:groups'] || '';
              const groupList = Array.isArray(groups) ? groups : groups.split(',');

              if (!groupList.includes('employees')) {
                // Not an employee
                cognitoUser.signOut();
                setError('You do not have access to the employee panel');
                setIsLoading(false);
                reject(new Error('You do not have access to the employee panel'));
                return;
              }

              const userData = {
                email: userAttrs.email || email,
                name: userAttrs.name || 'Employee',
                assignedEmail: userAttrs['custom:assigned_email'],
                ...userAttrs,
              };

              setUser(userData);
              setEmployee({
                email: userData.assignedEmail,
                name: userData.name,
                loginEmail: userData.email,
              });
              setIsLoading(false);
              resolve(result);
            }
          });
        },
        onFailure: (err) => {
          console.error('Login error:', err);
          setError(err.message || 'Login failed');
          setIsLoading(false);
          reject(err);
        },
        newPasswordRequired: (userAttributes) => {
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
    localStorage.removeItem('philocom_employee_user');

    if (userPool) {
      const cognitoUser = userPool.getCurrentUser();
      if (cognitoUser) {
        cognitoUser.signOut();
      }
    }
    setUser(null);
    setEmployee(null);
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
    employee,
    isLoading,
    error,
    isAuthenticated: !!user,
    employeeEmail: employee?.email,
    login,
    logout,
    completeNewPassword,
    getIdToken,
    checkAuthState,
  };

  return (
    <EmployeeAuthContext.Provider value={value}>
      {children}
    </EmployeeAuthContext.Provider>
  );
}

export function useEmployeeAuth() {
  const context = useContext(EmployeeAuthContext);
  if (!context) {
    throw new Error('useEmployeeAuth must be used within an EmployeeAuthProvider');
  }
  return context;
}

export default EmployeeAuthContext;
