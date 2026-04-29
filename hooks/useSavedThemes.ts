import { nanoid } from "nanoid";
import { useCallback, useEffect, useState } from "react";
import type { GradientStop, Theme } from "@/lib/types";

const STORAGE_KEY = "savedThemes";
const OLD_STORAGE_KEY = "customThemes";

function migrateOldTheme(old: any): Theme {
  const stops: GradientStop[] = [
    { id: nanoid(), position: 0, color: old.color1 || "#ffffff", opacity: 100 },
    {
      id: nanoid(),
      position: 100,
      color: old.color2 || "#000000",
      opacity: 100,
    },
  ];

  return {
    id: old.id || nanoid(),
    name: old.name || "Untitled",
    direction: old.direction || 135,
    stops,
  };
}

function isNewFormat(theme: any): boolean {
  return Array.isArray(theme.stops);
}

function loadFromStorage(): Theme[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((t: any) =>
          isNewFormat(t) ? t : migrateOldTheme(t),
        );
      }
    }

    // Migration from legacy storage key
    const oldRaw = localStorage.getItem(OLD_STORAGE_KEY);
    if (oldRaw) {
      const parsedOld = JSON.parse(oldRaw);
      if (Array.isArray(parsedOld)) {
        const migrated = parsedOld.map(migrateOldTheme);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        return migrated;
      }
    }

    return [];
  } catch {
    return [];
  }
}

function saveToStorage(themes: Theme[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(themes));
  } catch (error) {
    console.error("Failed to save custom themes:", error);
  }
}

export function useSavedThemes() {
  const [themes, setThemes] = useState<Theme[]>([]);

  useEffect(() => {
    setThemes(loadFromStorage());
  }, []);

  const saveTheme = useCallback((theme: Omit<Theme, "id">) => {
    const newTheme: Theme = { ...theme, id: nanoid() };
    setThemes((prev) => {
      const updated = [newTheme, ...prev];
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const deleteTheme = useCallback((id: string) => {
    setThemes((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      saveToStorage(updated);
      return updated;
    });
  }, []);

  return { themes, saveTheme, deleteTheme };
}
