
'use client';

import { WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function DisconnectedPage() {
  const { toast } = useToast();

  const handleRetry = () => {
    if (navigator.onLine) {
        window.location.reload();
    } else {
        toast({
            variant: 'destructive',
            title: 'Vẫn ngoại tuyến',
            description: 'Vui lòng kiểm tra lại kết nối mạng của bạn.',
        });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-6">
      <WifiOff className="h-24 w-24 text-muted-foreground mb-6" />
      <h1 className="text-3xl font-bold font-headline">Mất kết nối</h1>
      <p className="text-muted-foreground mt-2 max-w-md">
        Có vẻ như bạn đang ngoại tuyến. Vui lòng kiểm tra lại kết nối mạng và thử lại.
      </p>
      <Button onClick={handleRetry} className="mt-8">
        Thử lại
      </Button>
    </div>
  );
}
