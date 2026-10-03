import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { UNAUTHORIZED_EVENT, getStoredToken, getStoredUser } from "../services/api";
import { authService } from "../services/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getStoredToken()));
  const [isCheckingSession, setIsCheckingSession] = useState(
    Boolean(getStoredToken()),
  );

  useEffect(() => {
    if (!getStoredToken()) return undefined;

    let active = true;

    authService
      .me()
      .then((data) => {
        if (!active) return;
        setUser(data);
        setIsAuthenticated(true);
      })
      .catch(() => {
        if (!active) return;
        authService.logout();
        setUser(null);
        setIsAuthenticated(false);
      })
      .finally(() => {
        if (active) setIsCheckingSession(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function handleUnauthorized() {
      setUser(null);
      setIsAuthenticated(false);
    }

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    setUser(data);
    setIsAuthenticated(true);
    return data;
  }, []);

  const register = useCallback(async (payload) => {
    return authService.register(payload);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const data = await authService.updateProfile(payload);
    setUser(data);
    return data;
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isCheckingSession,
      login,
      register,
      logout,
      updateProfile,
    }),
    [
      user,
      isAuthenticated,
      isCheckingSession,
      login,
      register,
      logout,
      updateProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth precisa ser usado dentro de AuthProvider.");
  }

  return context;
}

export default AuthProvider;
