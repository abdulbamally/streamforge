import { useEffect, useState } from "react";
import { socialService } from "../services/socialService";
import type { SocialFeedItem } from "../types/social";

export function useSocialFeed() {
  const [feed, setFeed] = useState<SocialFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadFeed() {
      try {
        const data = await socialService.fetchFeed();
        if (mounted) {
          setFeed(data);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadFeed();

    return () => {
      mounted = false;
    };
  }, []);

  return { feed, isLoading };
}
