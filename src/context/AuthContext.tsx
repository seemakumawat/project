import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  user: { username: string; role: string } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);

  useEffect(() => {
    const savedAuth = localStorage.getItem('eduface_auth');
    if (savedAuth) {
      const authData = JSON.parse(savedAuth);
      setIsAuthenticated(true);
      setUser(authData.user);
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    // Demo credentials
    const validCredentials = [
      { username: 'admin', password: 'admin123', role: 'Administrator' },
      { username: 'lecturer', password: 'lecturer123', role: 'Lecturer' },
    ];

    const validUser = validCredentials.find(
      cred => cred.username === username && cred.password === password
    );

    if (validUser) {
      const userData = { username: validUser.username, role: validUser.role };
      setIsAuthenticated(true);
      setUser(userData);
      localStorage.setItem('eduface_auth', JSON.stringify({ user: userData }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('eduface_auth');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}