import React, { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "../services/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Coba ambil sesi yang ada
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Dengarkan perubahan status auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const authApi = {
    session,
    user,
    loading,
    signIn: (email, password) => {
      return supabase.auth.signInWithPassword({ email, password });
    },
    signUp: (email, password) => {
      return supabase.auth.signUp({ email, password });
    },
    signOut: () => {
      return supabase.auth.signOut();
    },
  };

  return (
    <AuthContext.Provider value={authApi}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
