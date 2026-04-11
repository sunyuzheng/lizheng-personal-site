import { fetchGuestDirectory, type GuestProfile } from "@shared/guest-data";
import { useEffect, useState } from "react";

let guestDirectoryCache: GuestProfile[] | null = null;
let guestDirectoryPromise: Promise<GuestProfile[]> | null = null;

async function loadGuestDirectory(): Promise<GuestProfile[]> {
  if (guestDirectoryCache) return guestDirectoryCache;
  if (!guestDirectoryPromise) {
    guestDirectoryPromise = fetchGuestDirectory()
      .then(guests => {
        guestDirectoryCache = guests;
        return guests;
      })
      .catch(error => {
        guestDirectoryPromise = null;
        throw error;
      });
  }

  return guestDirectoryPromise;
}

export function useGuestDirectory() {
  const [guests, setGuests] = useState<GuestProfile[]>(
    guestDirectoryCache ?? []
  );
  const [loading, setLoading] = useState(!guestDirectoryCache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadGuestDirectory()
      .then(data => {
        if (cancelled) return;
        setGuests(data);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError("嘉宾数据加载失败，请稍后重试。");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { guests, loading, error };
}
