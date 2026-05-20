import { useEffect, useState } from 'react';

export function useCommunity() {
  const [topics, setTopics] = useState<string[]>([]);

  useEffect(() => {
    setTopics(['Creator collaborations', 'Live events', 'Watch parties']);
  }, []);

  return { topics };
}
