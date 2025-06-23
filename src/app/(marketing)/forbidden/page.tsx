
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ForbiddenPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-6">
      <ShieldAlert className="h-24 w-24 text-destructive mb-6" />
      <h1 className="text-5xl font-extrabold font-headline text-destructive">403</h1>
      <h2 className="text-2xl font-semibold mt-4">Truy cập bị từ chối</h2>
      <p className="text-muted-foreground mt-2 max-w-md">
        Rất tiếc, bạn không có quyền truy cập vào tài nguyên này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là một sự nhầm lẫn.
      </p>
      <Button asChild className="mt-8">
        <Link href="/dashboard">Quay về Bảng điều khiển</Link>
      </Button>
    </div>
  );
}
