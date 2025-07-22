import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY_PREFIX = "comment-draft-";
const DEBOUNCE_MS = 500;

export function useCommentDraft(parentId: string) {
  const storageKey = `${STORAGE_KEY_PREFIX}${parentId}`;

  const [draft, setDraft] = useState(() => {
    try {
      return localStorage.getItem(storageKey) || "";
    } catch {
      return "";
    }
  });

  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const saveDraft = useCallback(
    (content: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        try {
          if (content) {
            localStorage.setItem(storageKey, content);
          } else {
            localStorage.removeItem(storageKey);
          }
        } catch {
          // Silently fail if localStorage is not available
        }
      }, DEBOUNCE_MS);
    },
    [storageKey],
  );

  const updateDraft = useCallback(
    (content: string) => {
      setDraft(content);
      saveDraft(content);
    },
    [saveDraft],
  );

  const clearDraft = useCallback(() => {
    setDraft("");
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // Silently fail if localStorage is not available
    }
  }, [storageKey]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { draft, updateDraft, clearDraft };
}
