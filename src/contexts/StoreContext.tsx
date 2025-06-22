'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { mockStores, mockUsers } from '@/lib/data';

type Store = typeof mockStores[0];

interface StoreContextType {
  store: Store;
  setStore: (store: Store) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store>(mockStores[0]);

  useEffect(() => {
    try {
      const loggedInUserId = localStorage.getItem('loggedInUserId');
      if (loggedInUserId) {
        const user = mockUsers.find(u => u.id === loggedInUserId);
        if (user && user.associated_store_ids.length > 0) {
          const userStoreId = user.associated_store_ids[0];
          const userStore = mockStores.find(s => s.id === userStoreId);
          if (userStore) {
            setStore(userStore);
          }
        }
      }
    } catch (error) {
      console.error("Could not initialize store from localStorage:", error);
    }
  }, []);

  const handleSetStore = (newStore: Store) => {
    setStore(newStore);
    // This updates the mock data as well, simulating a persistent change across reloads (during dev).
    // In a real app, this would be an API call.
    const storeIndex = mockStores.findIndex(s => s.id === newStore.id);
    if (storeIndex !== -1) {
        mockStores[storeIndex] = newStore;
    }
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
