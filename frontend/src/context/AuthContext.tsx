import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  userId: number;
  mail: string;
  exp: number;
  iat: number;
}

interface AuthContextType {
  token: string | null;
  userId: number | null;
  mail: string | null;
  isAuthenticated: boolean;
  login: (token: string, userId: number, mail: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [mail, setMail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      if (
        !storedToken ||
        storedToken === "null" ||
        storedToken === "undefined"
      ) {
        console.log("No valid token found");
        return;
      }

      try {
        const decoded = jwtDecode<DecodedToken>(storedToken);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          console.log("Expired token found, logging out");
          logout();
        } else {
          setToken(storedToken);
          setUserId(decoded.userId);
          setMail(decoded.mail);
        }
      } catch (err) {
        console.error("Invalid token", err);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = (newToken: string, newUserId: number, newMail: string) => {
    console.log("Login called with:", {
      newToken,
      newUserId,
      newMail,
    });
    if (!newToken || typeof newToken !== "string") {
      console.error("Token invalide:", newToken);
      return;
    }

    try {
      setToken(newToken);
      setUserId(newUserId);
      setMail(newMail);

      localStorage.setItem("token", newToken);
      localStorage.setItem("userId", newUserId.toString());
      localStorage.setItem("mail", newMail);
    } catch (err) {
      console.error("Login error", err);
    }
  };

  const logout = () => {
    setToken(null);
    setUserId(null);
    setMail(null);

    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("mail");
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        token,
        userId,
        mail,
        isAuthenticated,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};