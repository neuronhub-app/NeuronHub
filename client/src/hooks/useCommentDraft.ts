import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY_PREFIX = "comment-draft-";
const DEBOUNCE_MS = 500;

// AI shit
export function useCommentDraft(parentId: string) {
  const storageKey = `${STORAGE_KEY_PREFIX}${parentId}`;

  const [content, setContent] = useState(() => {
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

  const update = useCallback(
    (content: string) => {
      setContent(content);
      saveDraft(content);
    },
    [saveDraft],
  );

  const clear = useCallback(() => {
    setContent("");
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

  return { content, update, clear };
}
