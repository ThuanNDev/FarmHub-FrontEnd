import { Suspense } from 'react';
import VerifyOtpForm from './VerifyOtpForm';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Leaf } from 'lucide-react';

function Loading() {
  return (
    <Card className="w-full max-w-sm shadow-2xl">
      <CardHeader className="text-center p-6">
        <div className="flex justify-center items-center gap-2 mb-4">
          <Leaf className="h-8 w-8 text-primary" />
          <Skeleton className="h-8 w-40" />
        </div>
        <Skeleton className="h-7 w-48 mx-auto" />
        <Skeleton className="h-4 w-full mt-2" />
        <Skeleton className="h-4 w-5/6 mt-1 mx-auto" />
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full mt-2" />
        </div>
      </CardContent>
    </Card>
  );
}


export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<Loading />}>
      <VerifyOtpForm />
    </Suspense>
  );
}
