import { useCallback, useEffect, useRef, useState } from "react";

// #AI todo refac: drop all. try to an npm package
// todo refac-name: useCommentDraft
export function usePostCommentDraft(parentId: string) {
  const storageKey = `comment-draft-${parentId}`;

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
      }, 500);
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
