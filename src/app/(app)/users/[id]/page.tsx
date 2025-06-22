'use client';

import * as React from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { ArrowLeft, Mail, Phone, Shield, User, Briefcase, CalendarCheck, Clock } from 'lucide-react';
import { mockUsers, mockStores } from '@/lib/data';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function UserDetailPage() {
  const params = useParams<{ id: string }>();
  const user = mockUsers.find((u) => u.id === params.id);
  
  const [createdAt, setCreatedAt] = React.useState('');
  const [lastLoginAt, setLastLoginAt] = React.useState('');

  React.useEffect(() => {
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Chưa đăng nhập';
        const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    }
    if (user) {
        setCreatedAt(formatDate(user.created_at));
        setLastLoginAt(formatDate(user.last_login_at));
    }
  }, [user]);

  if (!user) {
    notFound();
  }
  
  const associatedStores = mockStores.filter(store => user.associated_store_ids.includes(store.id));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-start">
        <Button asChild variant="outline" size="sm">
          <Link href="/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách nhân viên
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={`https://placehold.co/128x128.png`} alt={user.full_name} />
              <AvatarFallback>{user.full_name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="font-headline text-2xl">{user.full_name}</CardTitle>
              <CardDescription>@{user.username}</CardDescription>
            </div>
            <Badge variant={user.is_active ? 'default' : 'secondary'} className="ml-auto">
              {user.is_active ? 'Hoạt động' : 'Vô hiệu hóa'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
            <Separator className="my-4"/>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
                <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">{user.phone || 'Chưa cập nhật'}</span>
                </div>
                <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">{user.role} {user.is_superadmin && '(Superadmin)'}</span>
                </div>
                <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                    <div className="text-sm">
                        {associatedStores.map(store => store.name).join(', ') || 'Chưa liên kết'}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <CalendarCheck className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">Ngày tạo: {createdAt || '...'}</span>
                </div>
                <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">Đăng nhập lần cuối: {lastLoginAt || '...'}</span>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
