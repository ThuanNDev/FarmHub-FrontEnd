
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
import { useLanguage } from '@/store/LanguageContext';

export default function UserDetailPage() {
  const params = useParams<{ id: string }>();
  const user = mockUsers.find((u) => u.userId === params.id);
  const { t } = useLanguage();
  
  const [createdAt, setCreatedAt] = React.useState('');
  const [lastLoginAt, setLastLoginAt] = React.useState('');

  React.useEffect(() => {
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Chưa đăng nhập';
        const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    }
    if (user) {
        setCreatedAt(formatDate(user.createdAt));
        setLastLoginAt(formatDate(user.lastLoginAt));
    }
  }, [user]);

  if (!user) {
    notFound();
  }
  
  const associatedStores = mockStores.filter(store => user.associatedStoreIds.includes(store.storeId));

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
              <AvatarImage src={`https://picsum.photos/seed/${user.userId}/128/128`} alt={user.fullName} />
              <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="font-headline text-2xl">{user.fullName}</CardTitle>
              <CardDescription>@{user.username}</CardDescription>
            </div>
            <Badge variant={user.isActive ? 'default' : 'secondary'} className="ml-auto">
              {t(user.isActive ? 'status.active' : 'status.inactive')}
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
                    <span className="text-sm">{user.role} {user.isSuperadmin && '(Superadmin)'}</span>
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
