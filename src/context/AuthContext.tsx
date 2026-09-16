'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: { user: User; role: string }[];
  tasks?: any[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  projects: Project[];
  activeProject: Project | null;
  setActiveProject: (project: Project | null) => void;
  usersList: User[];
  fetchProjects: () => Promise<void>;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsersList(data.users || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        const projList: Project[] = data.projects || [];
        setProjects(projList);
        if (projList.length > 0) {
          // Keep current active project or default to first
          setActiveProject((prev) => {
            if (prev) {
              const updated = projList.find((p) => p.id === prev.id);
              return updated || projList[0];
            }
            return projList[0];
          });
        } else {
          setActiveProject(null);
        }
      }
    } catch (e) {
      console.error('Fetch projects error:', e);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchProjects();
      fetchUsers();
    }
  }, [user]);

  const login = (token: string, userData: User) => {
    setUser(userData);
    fetchProjects();
    fetchUsers();
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
      setProjects([]);
      setActiveProject(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        projects,
        activeProject,
        setActiveProject,
        usersList,
        fetchProjects,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
