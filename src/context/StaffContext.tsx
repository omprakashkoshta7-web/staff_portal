import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import staffService from "../services/staff.service";
import {
  clearStoredSession,
  logoutFirebase,
  syncStaffAuthSession,
  type StaffAuthUser,
  type StaffTeam,
} from "../services/firebase-auth";

type StaffRole = StaffTeam;

export interface StaffUser {
  id: string;
  email: string;
  name: string;
  role: "staff" | "admin";
  team: StaffRole;
  permissions: string[];
  scopes: string[];
}

interface StaffContextType {
  role: StaffRole;
  setRole: (r: StaffRole) => void;
  user: StaffUser | null;
  setUser: (u: StaffUser | null) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  setToken: (t: string | null) => void;
  logout: () => Promise<void>;
}

const StaffContext = createContext<StaffContextType>({
  role: "ops",
  setRole: () => {},
  user: null,
  setUser: () => {},
  isAuthenticated: false,
  isLoading: true,
  token: null,
  setToken: () => {},
  logout: async () => {},
});

const mapContextUser = (user: StaffAuthUser): StaffUser => ({
  id: user.uid,
  email: user.email,
  name: user.displayName || user.email,
  role: user.role,
  team: user.team,
  permissions: user.permissions,
  scopes: user.scopes,
});

export function StaffProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<StaffRole>("ops");
  const [user, setUser] = useState<StaffUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = syncStaffAuthSession(
      ({ user: sessionUser, token: sessionToken }) => {
        const mappedUser = mapContextUser(sessionUser);
        setUser(mappedUser);
        setRole(mappedUser.team);
        setToken(sessionToken);
        setIsAuthenticated(true);
        staffService.setToken(sessionToken);
        setIsLoading(false);
      },
      () => {
        setUser(null);
        setRole("ops");
        setToken(null);
        setIsAuthenticated(false);
        clearStoredSession();
        staffService.clearToken();
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const logout = async () => {
    setUser(null);
    setIsAuthenticated(false);
    setToken(null);
    setRole("ops");
    staffService.clearToken();
    clearStoredSession();
    await logoutFirebase();
  };

  return (
    <StaffContext.Provider
      value={{
        role,
        setRole,
        user,
        setUser,
        isAuthenticated,
        isLoading,
        token,
        setToken,
        logout,
      }}
    >
      {children}
    </StaffContext.Provider>
  );
}

export function useStaffRole() {
  return useContext(StaffContext);
}
