import { useState } from 'react';

export function useWalletStore() {
  const [balance, setBalance] = useState<number>(0);
  return { balance, setBalance };
}
