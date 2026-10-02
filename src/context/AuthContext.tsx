"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type UserRole = "admin" | "client";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  phone?: string | null;
  company?: string | null;
  status?: "active" | "blocked";
  avatar_url?: string | null;
  created_at?: string;
}

export interface SignInResult {
  user: User | null;
  profile: Profile | null;
  error: Error | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role?: UserRole
  ) => Promise<{ error: Error | null }>;
  resetPasswordForEmail: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const ADMIN_EMAILS = [
    "mairareis2017@gmail.com",
    "admin@mairareis.com.br",
  ];

  const getFallbackProfile = (userId: string, userEmail?: string): Profile => {
    const emailLower = (userEmail || "").trim().toLowerCase();
    const isAdmin = ADMIN_EMAILS.includes(emailLower);
    return {
      id: userId,
      email: userEmail || "",
      full_name: isAdmin ? "Maira Reis" : (userEmail?.split("@")[0] || "Cliente"),
      role: isAdmin ? "admin" : "client",
      status: "active",
    };
  };

  const fetchProfile = async (userId: string, userEmail?: string): Promise<Profile> => {
    const fallback = getFallbackProfile(userId, userEmail);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (data) {
        const resolved = data as Profile;
        setProfile(resolved);
        return resolved;
      }

      // Try inserting if not found in database
      try {
        const { data: created } = await supabase
          .from("profiles")
          .upsert([fallback])
          .select()
          .maybeSingle();
        if (created) {
          const resolved = created as Profile;
          setProfile(resolved);
          return resolved;
        }
      } catch (insertErr) {
        console.warn("Could not insert profile in database, using local fallback:", insertErr);
      }

      setProfile(fallback);
      return fallback;
    } catch (err) {
      console.warn("Error fetching profile, using local fallback:", err);
      setProfile(fallback);
      return fallback;
    }
  };

  useEffect(() => {
    let isMounted = true;

    // 1. Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted) return;
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id, session.user.email);
        setLoading(false);
      } else {
        if (typeof window !== "undefined") {
          try {
            const saved = JSON.parse(localStorage.getItem("portfolio_client_session_v1") || "null");
            if (saved?.user && saved?.profile) {
              setUser(saved.user);
              setProfile(saved.profile);
            } else {
              setUser(null);
              setProfile(null);
            }
          } catch (e) {
            setUser(null);
            setProfile(null);
          }
        }
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
    });

    // 2. Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id, session.user.email);
      } else {
        if (typeof window !== "undefined") {
          const saved = JSON.parse(localStorage.getItem("portfolio_client_session_v1") || "null");
          if (saved?.user && saved?.profile) {
            setUser(saved.user);
            setProfile(saved.profile);
            return;
          }
        }
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<SignInResult> => {
    try {
      const trimmedEmail = email.trim().toLowerCase();

      // 1. Standard Supabase Auth attempt
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (!error && data.user) {
        setUser(data.user);
        const resolvedProfile = await fetchProfile(data.user.id, data.user.email);
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "portfolio_client_session_v1",
            JSON.stringify({ user: data.user, profile: resolvedProfile })
          );
        }
        return { user: data.user, profile: resolvedProfile, error: null };
      }

      // 2. Resilient Backend Client Login Fallback
      try {
        const res = await fetch("/api/auth/client-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: trimmedEmail, password }),
        });
        const apiData = await res.json();

        if (res.ok && apiData.success && apiData.user) {
          const resolvedProfile =
            apiData.profile || (await fetchProfile(apiData.user.id, apiData.user.email));
          setUser(apiData.user);
          setProfile(resolvedProfile);

          if (typeof window !== "undefined") {
            localStorage.setItem(
              "portfolio_client_session_v1",
              JSON.stringify({ user: apiData.user, profile: resolvedProfile })
            );
          }
          return { user: apiData.user, profile: resolvedProfile, error: null };
        }

        if (apiData.error && !apiData.error.toLowerCase().includes("não encontrado")) {
          return { user: null, profile: null, error: new Error(apiData.error) };
        }
      } catch (apiErr) {
        console.warn("Client login API fallback failed:", apiErr);
      }

      // 3. Fallback: If both Supabase and Backend check returned error, reject login
      return {
        user: null,
        profile: null,
        error: error || new Error("E-mail ou senha incorretos. Verifique suas credenciais."),
      };
    } catch (err: any) {
      return { user: null, profile: null, error: err };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole = "client"
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });
    if (error) return { error };
    if (data.user) {
      await fetchProfile(data.user.id, data.user.email);
    }
    return { error: null };
  };

  const resetPasswordForEmail = async (email: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${origin}/login?type=recovery`,
    });
    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    try {
      if (user?.email) {
        await fetch("/api/admin/update-client", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientId: user.id,
            email: user.email,
            password: newPassword,
            fullName: profile?.full_name || "",
          }),
        });
      }
    } catch (e) {}

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error };
  };

  const signOut = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("portfolio_client_session_v1");
    }
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Sign out error:", err);
    } finally {
      setUser(null);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user.email);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUp,
        resetPasswordForEmail,
        updatePassword,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
