
import Link from 'next/link';
import { Frown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-6">
      <Frown className="h-24 w-24 text-primary mb-6" />
      <h1 className="text-5xl font-extrabold font-headline text-primary">404</h1>
      <h2 className="text-2xl font-semibold mt-4">Trang không tồn tại</h2>
      <p className="text-muted-foreground mt-2 max-w-md">
        Rất tiếc, chúng tôi không thể tìm thấy trang bạn đang tìm kiếm. Có thể trang đã bị xóa hoặc URL đã bị thay đổi.
      </p>
      <Button asChild className="mt-8">
        <Link href="/dashboard">Quay về Bảng điều khiển</Link>
      </Button>
    </div>
  );
}
