
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import POSPageContent from './POSPageContent';

function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Đang tải giao diện bán hàng...</p>
      </div>
    </div>
  );
}

export default function POSPage() {
  return (
    <Suspense fallback={<Loading />}>
      <POSPageContent />
    </Suspense>
  );
}

    