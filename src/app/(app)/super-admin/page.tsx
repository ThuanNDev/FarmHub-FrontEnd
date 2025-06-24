
'use client';

import React from 'react';
import { mockUsers } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Building, BarChart3, Users, HeartPulse, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export default function SuperAdminPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = React.useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);

  React.useEffect(() => {
    const userId = localStorage.getItem('loggedInUserId');
    if (userId) {
      const user = mockUsers.find(u => u.userId === userId);
      setCurrentUser(user || null);
    }
    setIsCheckingAuth(false);
  }, []);

  if (isCheckingAuth) {
    return (
        <div className="space-y-6">
            <div className="p-0">
                <Skeleton className="h-9 w-1/2" />
                <Skeleton className="h-4 w-3/4 mt-2" />
            </div>
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
             </div>
        </div>
    );
  }

  if (!currentUser || !currentUser.isSuperadmin) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-muted rounded-lg">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold">Truy cập bị từ chối</h1>
        <p className="text-muted-foreground">Bạn không có quyền truy cập trang này.</p>
        <Button onClick={() => router.push('/')} className="mt-4">
          Về Bảng điều khiển
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-0">
        <CardTitle className="text-3xl font-headline">Bảng điều khiển Super Admin</CardTitle>
        <CardDescription>Quản lý và tổng quan toàn bộ hệ thống.</CardDescription>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline"><Building /> Quản lý Cửa hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Thêm, xem, sửa, và quản lý tất cả các cửa hàng trên nền tảng.</p>
            <Button asChild variant="secondary" className="mt-4 w-full">
              <Link href="/create-store">Tạo cửa hàng mới</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline"><BarChart3 /> Phân tích Toàn hệ thống</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Xem báo cáo doanh thu, người dùng, và sản phẩm tổng hợp.</p>
            <Button variant="secondary" className="mt-4 w-full">Xem Phân tích</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline"><Users /> Quản lý Người dùng</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Quản lý tất cả tài khoản người dùng, bao gồm cả các Admin khác.</p>
             <Button asChild variant="secondary" className="mt-4 w-full">
                <Link href="/users">Đi đến Quản lý Người dùng <ExternalLink className="ml-2 h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline"><HeartPulse /> Trạng thái Hệ thống</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Kiểm tra tình trạng máy chủ, cơ sở dữ liệu và các dịch vụ AI.</p>
            <Button variant="secondary" className="mt-4 w-full">Kiểm tra Trạng thái</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
