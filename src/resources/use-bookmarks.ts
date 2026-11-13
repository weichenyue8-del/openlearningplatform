"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";

import {
  parseResourceBookmarks,
  RESOURCE_BOOKMARK_EVENT,
  RESOURCE_BOOKMARK_STORAGE_KEY,
  toggleResourceBookmark,
} from "./storage";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(RESOURCE_BOOKMARK_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(RESOURCE_BOOKMARK_EVENT, callback);
  };
}

function getSnapshot() {
  try {
    return window.localStorage.getItem(RESOURCE_BOOKMARK_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function getServerSnapshot() {
  return "";
}

export function useResourceBookmarks(resourceIds: string[], authenticated = false) {
  const validIds = useMemo(() => new Set(resourceIds), [resourceIds]);
  const serializedBookmarks = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const localSavedIds = useMemo(
    () => new Set(
      parseResourceBookmarks(serializedBookmarks)
        .map((item) => item.resourceId)
        .filter((id) => validIds.has(id)),
    ),
    [serializedBookmarks, validIds],
  );
  const [cloudSavedIds, setCloudSavedIds] = useState<Set<string>>(new Set());
  const [cloudReady, setCloudReady] = useState(!authenticated);
  const [syncError, setSyncError] = useState<string>();

  useEffect(() => {
    if (!authenticated) {
      const timer = window.setTimeout(() => {
        setCloudReady(true);
        setSyncError(undefined);
      }, 0);
      return () => window.clearTimeout(timer);
    }
    const controller = new AbortController();
    const loadingTimer = window.setTimeout(() => setCloudReady(false), 0);
    void fetch("/api/learning/bookmarks", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error();
        const data = await response.json() as { resourceIds: string[] };
        setCloudSavedIds(new Set(data.resourceIds.filter((id) => validIds.has(id))));
        setSyncError(undefined);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setSyncError("Saved resources could not be synchronized.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setCloudReady(true);
      });
    return () => {
      window.clearTimeout(loadingTimer);
      controller.abort();
    };
  }, [authenticated, validIds]);

  const savedIds = authenticated ? cloudSavedIds : localSavedIds;

  const toggle = useCallback((resourceId: string) => {
    // `resourceIds` describes what this view may toggle, not the full catalog.
    // Reading/writing with that subset would silently delete bookmarks saved
    // from another lesson or resource view.
    if (!validIds.has(resourceId)) return false;
    if (!authenticated) {
      const result = toggleResourceBookmark(resourceId);
      return result.written;
    }
    if (!cloudReady) return false;
    const wasSaved = cloudSavedIds.has(resourceId);
    setCloudSavedIds((current) => {
      const next = new Set(current);
      if (wasSaved) next.delete(resourceId);
      else next.add(resourceId);
      return next;
    });
    setSyncError(undefined);
    void fetch("/api/learning/bookmarks", {
      method: wasSaved ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resourceId }),
    }).then((response) => {
      if (!response.ok) throw new Error();
    }).catch(() => {
      setCloudSavedIds((current) => {
        const next = new Set(current);
        if (wasSaved) next.add(resourceId);
        else next.delete(resourceId);
        return next;
      });
      setSyncError("That bookmark could not be synchronized. Its previous state was restored.");
    });
    return true;
  }, [authenticated, cloudReady, cloudSavedIds, validIds]);

  return { savedIds, toggle, cloudReady, syncError };
}
