
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
        const user = mockUsers.find(u => u.userId === loggedInUserId);
        if (user && user.associatedStoreIds.length > 0) {
          const userStoreId = user.associatedStoreIds[0];
          const userStore = mockStores.find(s => s.storeId === userStoreId);
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
    const storeIndex = mockStores.findIndex(s => s.storeId === newStore.storeId);
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
