'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { mockStores } from '@/lib/data';

type Store = typeof mockStores[0];

interface StoreContextType {
  store: Store;
  setStore: (store: Store) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store>(mockStores[0]);

  const handleSetStore = (newStore: Store) => {
    setStore(newStore);
    // This updates the mock data as well, simulating a persistent change across reloads (during dev).
    // In a real app, this would be an API call.
    mockStores[0] = newStore;
  }

  return (
    <StoreContext.Provider value={{ store, setStore: handleSetStore }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
