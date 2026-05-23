import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../api/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  loginState: (user: any, accessToken: string, refreshToken: string) => void;
  logoutState: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');

      // If we have neither token, skip — user is not logged in
      if (!accessToken && !refreshToken) {
        setIsLoading(false);
        return;
      }

      try {
        // Try to fetch profile (the interceptor will auto-refresh if the access token is expired)
        const { user } = await authService.profile();
        setUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        // Both access and refresh tokens are dead — clear everything
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('korix_user');
        setIsAuthenticated(false);
        setUser(null);
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const loginState = (userData: any, accessToken: string, refreshToken: string) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logoutState = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout API failed', err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('korix_user');
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loginState, logoutState, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
