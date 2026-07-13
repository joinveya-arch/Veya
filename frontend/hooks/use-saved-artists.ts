"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "veya.saved";
const EVENT = "veya:saved-change";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

/**
 * Saved artists live in localStorage — the API has no favourites resource
 * yet. A custom event keeps every mounted card in sync, which `storage`
 * alone can't do (it only fires in *other* tabs).
 */
export function useSavedArtists() {
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => setSaved(read());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggle = useCallback((id: string) => {
    const current = read();
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id];
    window.localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT));
    return next.includes(id);
  }, []);

  const isSaved = useCallback((id: string) => saved.includes(id), [saved]);

  return { saved, toggle, isSaved };
}
