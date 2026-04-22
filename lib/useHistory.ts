"use client";

import { useCallback, useState } from "react";
import type { EditorState } from "./types";

const MAX_HISTORY = 50;

type StateUpdater = EditorState | ((prev: EditorState) => EditorState);

interface HistoryState {
  current: EditorState;
  past: EditorState[];
  future: EditorState[];
  lastCommitted: EditorState;
}

export function useHistory(initial: EditorState) {
  const [hist, setHist] = useState<HistoryState>({
    current: initial,
    past: [],
    future: [],
    lastCommitted: initial,
  });

  const setState = useCallback((update: React.SetStateAction<EditorState>) => {
    setHist((prev) => ({
      ...prev,
      current:
        typeof update === "function" ? (update as any)(prev.current) : update,
    }));
  }, []);

  const commit = useCallback((update: StateUpdater) => {
    setHist((prev) => {
      const nextState =
        typeof update === "function" ? update(prev.current) : update;

      if (prev.lastCommitted !== nextState) {
        return {
          current: nextState,
          past: [...prev.past.slice(-(MAX_HISTORY - 1)), prev.lastCommitted],
          future: [],
          lastCommitted: nextState,
        };
      }
      return prev;
    });
  }, []);

  const undo = useCallback(() => {
    setHist((prev) => {
      if (prev.past.length === 0) return prev;
      const previous = prev.past[prev.past.length - 1];
      return {
        current: previous,
        past: prev.past.slice(0, -1),
        future: [...prev.future, prev.lastCommitted],
        lastCommitted: previous,
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHist((prev) => {
      if (prev.future.length === 0) return prev;
      const next = prev.future[prev.future.length - 1];
      return {
        current: next,
        past: [...prev.past, prev.lastCommitted],
        future: prev.future.slice(0, -1),
        lastCommitted: next,
      };
    });
  }, []);

  const resetHistory = useCallback((freshState: EditorState) => {
    setHist({
      current: freshState,
      past: [],
      future: [],
      lastCommitted: freshState,
    });
  }, []);

  return {
    state: hist.current,
    setState,
    commit,
    undo,
    redo,
    canUndo: hist.past.length > 0,
    canRedo: hist.future.length > 0,
    resetHistory,
  };
}
