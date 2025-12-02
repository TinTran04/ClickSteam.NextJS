"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  getCurrentUser,
  signIn as cognitoSignIn,
  signOut as cognitoSignOut,
  signUp as cognitoSignUp,
} from "@/lib/cognito";

type AuthContextType = {
  isLoaded: boolean;
  isSignedIn: boolean;
  userId: string | null;
  email: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  /** Dùng sau khi Amplify login xong để sync lại state, không cần F5 */
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  // Hàm dùng chung: đọc session Cognito và cập nhật state
  const syncFromCognito = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        setIsSignedIn(true);
        setUserId(user.userId);
        setEmail(user.email ?? null);
      } else {
        setIsSignedIn(false);
        setUserId(null);
        setEmail(null);
      }
    } catch (err) {
      console.error("Error loading current user", err);
      setIsSignedIn(false);
      setUserId(null);
      setEmail(null);
      throw err;
    }
  };

  // load session khi reload page
  useEffect(() => {
    syncFromCognito()
      .catch(() => {
        // đã log ở trên
      })
      .finally(() => setIsLoaded(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    await cognitoSignIn(email, password);
    await syncFromCognito();
  };

  const handleSignUp = async (email: string, password: string) => {
    await cognitoSignUp(email, password);
  };

  const handleSignOut = async () => {
    await cognitoSignOut();
    await syncFromCognito();
  };

  const refreshUser = async () => {
    await syncFromCognito();
  };

  return (
    <AuthContext.Provider
      value={{
        isLoaded,
        isSignedIn,
        userId,
        email,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
