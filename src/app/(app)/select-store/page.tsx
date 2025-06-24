
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { mockStores } from '@/lib/data';
import type { Store } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, MoveRight, Loader2 } from 'lucide-react';

export default function SelectStorePage() {
  const router = useRouter();
  const [userStores, setUserStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedIdsString = localStorage.getItem('associatedStoreIds');
      if (storedIdsString) {
        const storeIds: string[] = JSON.parse(storedIdsString);
        const stores = mockStores.filter(store => storeIds.includes(store.storeId));
        setUserStores(stores);
      }
    } catch (error) {
      console.error("Failed to parse store IDs from localStorage", error);
    }
    setIsLoading(false);
  }, []);

  const handleSelectStore = (storeId: string) => {
    localStorage.setItem('selectedStoreId', storeId);
    router.push('/');
  };

  if (isLoading) {
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    );
  }
  
  if (userStores.length === 0) {
     return (
        <div className="flex h-screen items-center justify-center text-center">
            <div>
                <h1 className="text-2xl font-bold">Không tìm thấy cửa hàng</h1>
                <p className="text-muted-foreground">Tài khoản của bạn chưa được liên kết với cửa hàng nào.</p>
                <Button onClick={() => router.push('/create-store')} className="mt-4">
                    Tạo cửa hàng mới
                </Button>
            </div>
        </div>
     )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Chọn cửa hàng của bạn</CardTitle>
          <CardDescription>Vui lòng chọn cửa hàng bạn muốn truy cập.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {userStores.map(store => (
            <button
              key={store.storeId}
              onClick={() => handleSelectStore(store.storeId)}
              className="w-full text-left"
            >
              <Card className="hover:bg-accent hover:border-primary transition-all">
                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <Building className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{store.name}</CardTitle>
                    <CardDescription>{store.address}</CardDescription>
                  </div>
                   <MoveRight className="ml-auto h-5 w-5 text-muted-foreground"/>
                </CardHeader>
              </Card>
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
