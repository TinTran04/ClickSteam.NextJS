"use client";

import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function SignedIn({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return null;
  return isSignedIn ? <>{children}</> : null;
}

export function SignedOut({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return null;
  return !isSignedIn ? <>{children}</> : null;
}
