import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return true;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const { exp } = JSON.parse(jsonPayload);
    if (exp && exp * 1000 < Date.now()) {
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSsoUser, setIsSsoUser] = useState(() => localStorage.getItem('is_sso_session') === 'true');

  useEffect(() => {
    const handleAuthLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('srs_token');
      localStorage.removeItem('user');
      localStorage.removeItem('srs_user');
      localStorage.removeItem('is_sso_session');
      sessionStorage.removeItem('dashboard_cache_data');
      setUser(null);
      setIsSsoUser(false);
    };

    window.addEventListener('auth:logout', handleAuthLogout);

    // Check if user is logged in on app start
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const isSsoStored = localStorage.getItem('is_sso_session') === 'true';

    // Set loading to false immediately to show skeleton, then verify auth in background
    setLoading(false);

    if (token && savedUser) {
      if (isTokenExpired(token)) {
        console.warn('[AuthContext] Token expired upon launch. Performing automatic logout.');
        handleAuthLogout();
      } else {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser({
            ...parsedUser,
            permissions: parsedUser.permissions || []
          });
          setIsSsoUser(isSsoStored);
        } catch (error) {
          console.error('Failed to parse saved user from storage', error);
          handleAuthLogout();
        }
      }
    } else {
      setIsSsoUser(false);
    }

    return () => {
      window.removeEventListener('auth:logout', handleAuthLogout);
    };
  }, []);

  const login = async (identifier, password) => {
    try {
      const response = await api.post('/auth/login', {
        identifier,
        employeeId: identifier,
        email: identifier,
        password
      });
      const { token, user: userData } = response.data;
      const normalizedUser = {
        ...userData,
        permissions: userData.permissions || [],
        hasPanelMemberAccess: userData.hasPanelMemberAccess || false
      };

      localStorage.setItem('token', token);
      localStorage.setItem('srs_token', token);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      localStorage.setItem('srs_user', JSON.stringify(normalizedUser));
      localStorage.removeItem('is_sso_session');
      setIsSsoUser(false);
      setUser(normalizedUser);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const ssoLogin = async (token) => {
    try {
      const response = await api.post('/auth/sso-login', { token });
      const { token: localToken, user: userData } = response.data;
      const normalizedUser = {
        ...userData,
        permissions: userData.permissions || {},
        hasPanelMemberAccess: userData.hasPanelMemberAccess || false
      };

      localStorage.setItem('token', localToken);
      localStorage.setItem('srs_token', localToken);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      localStorage.setItem('srs_user', JSON.stringify(normalizedUser));
      localStorage.setItem('is_sso_session', 'true');
      setIsSsoUser(true);
      setUser(normalizedUser);

      return { success: true, user: normalizedUser };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'SSO authentication failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('srs_token');
    localStorage.removeItem('user');
    localStorage.removeItem('srs_user');
    localStorage.removeItem('is_sso_session');
    setIsSsoUser(false);
    setUser(null);
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      const updatedUser = {
        ...user,
        ...response.data.user,
        permissions: response.data.user?.permissions || user?.permissions || []
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Profile update failed'
      };
    }
  };

  const hasPermission = (permission, requireWrite = false) => {
    if (!permission || !user) {
      return false;
    }

    if (user.role === 'super_admin') {
      return true;
    }

    if (user.role === 'sub_admin') {
      // Handle both old format (array) and new format (object with access levels)
      if (Array.isArray(user.permissions)) {
        // Old format: array of permission keys (all are full_access)
        return user.permissions.includes(permission) || user.permissions.includes('*');
      }

      // New format: object with access levels
      if (typeof user.permissions === 'object' && user.permissions !== null) {
        const accessLevel = user.permissions[permission];
        
        if (accessLevel === 'full_access') {
          return true; // Full access allows both read and write
        }
        
        // Support both 'view_only' (new) and 'read_only' (legacy)
        if (accessLevel === 'view_only' || accessLevel === 'read_only') {
          return !requireWrite; // View-only only allows read/view operations
        }
        
        // Check for wildcard
        if (user.permissions['*'] === 'full_access') {
          return true;
        }
        
        if (user.permissions['*'] === 'view_only' || user.permissions['*'] === 'read_only') {
          return !requireWrite;
        }
      }
    }

    return false;
  };

  // Check if user has write permission (full access only)
  const hasWritePermission = (permission) => {
    return hasPermission(permission, true);
  };

  const value = {
    user,
    loading,
    login,
    ssoLogin,
    logout,
    register,
    updateProfile,
    isAuthenticated: !!user,
    isSsoUser: Boolean(isSsoUser),
    isSuperAdmin: user?.role === 'super_admin',
    isSubAdmin: user?.role === 'sub_admin',
    isPanelMember: user?.role === 'panel_member',
    isCandidate: user?.role === 'candidate',
    permissions: user?.permissions || [],
    hasPermission,
    hasWritePermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
