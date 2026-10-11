"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import {
  addScore,
  getScoresSnapshot,
  getServerScoresSnapshot,
  getServerUserSnapshot,
  getUserSnapshot,
  MAX_NAME_LENGTH,
  setUser,
  subscribe,
  type LocalScore,
  type Session,
} from "@/lib/scores";

type SessionContextValue = {
  user: Session | null;
  scores: LocalScore[];
  login: (name: string) => void;
  signOut: () => void;
  saveScore: (entry: Omit<LocalScore, "at">) => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

// El servidor y la hidratación ven user = null y sin puntajes locales;
// el valor real de localStorage entra tras montar.
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const user = useSyncExternalStore(subscribe, getUserSnapshot, getServerUserSnapshot);
  const scores = useSyncExternalStore(
    subscribe,
    getScoresSnapshot,
    getServerScoresSnapshot,
  );

  const login = useCallback((name: string) => {
    setUser({ name: name.trim().toUpperCase().slice(0, MAX_NAME_LENGTH) });
  }, []);
  const signOut = useCallback(() => setUser(null), []);
  const saveScore = useCallback((entry: Omit<LocalScore, "at">) => addScore(entry), []);

  const value = useMemo(
    () => ({ user, scores, login, signOut, saveScore }),
    [user, scores, login, signOut, saveScore],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession debe usarse dentro de <SessionProvider>");
  return ctx;
}
