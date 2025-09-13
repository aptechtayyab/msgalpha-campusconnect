import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const BookmarkContext = createContext(null);
const STORAGE_KEY = "cc:bookmarks:v1"; // session-only

function readFromSession() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(parsed);
  } catch {
    return new Set();
  }
}

function writeToSession(setLike) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(setLike)));
  } catch {}
}

export function BookmarkProvider({ children }) {
  const [ids, setIds] = useState(() => readFromSession());

  useEffect(() => {
    writeToSession(ids);
  }, [ids]);

  const api = useMemo(() => {
    const isBookmarked = (id) => ids.has(id);
    const add = (id) => setIds((s) => new Set(s).add(id));
    const remove = (id) =>
      setIds((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
    const toggle = (id) => (ids.has(id) ? remove(id) : add(id));
    const clearAll = () => setIds(new Set());
    return { ids, isBookmarked, add, remove, toggle, clearAll };
  }, [ids]);

  return <BookmarkContext.Provider value={api}>{children}</BookmarkContext.Provider>;
}

export function useBookmarks() {
  const ctx = useContext(BookmarkContext);
  if (!ctx) throw new Error("useBookmarks must be used within <BookmarkProvider>");
  return ctx;
}
