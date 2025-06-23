
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Leaf, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { mockUsers, mockStores } from '@/lib/data';
import { useLanguage } from '@/store/LanguageContext';
import { loginSchema } from '@/lib/form-schemas';
import { API_URLS } from '@/lib/api-config';
import type { User, ApiUser } from '@/types';
import { UserRole } from '@/types';

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      usernameOrEmail: 'ThuanNguyen',
      password: 'SecurePass123',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch(API_URLS.AUTH.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usernameOrEmail: values.usernameOrEmail,
          password: values.password
        }),
      });

      const data = await response.json();

      if (!response.ok || data.status !== 'success') {
        throw new Error(data.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
      }

      const { access_token, user: apiUser } = data.data as { access_token: string; user: ApiUser };
      
      // Store token
      localStorage.setItem('accessToken', access_token);
      
      // Update mock data in memory for the session
      const existingUserIndex = mockUsers.findIndex(u => u.userId === apiUser.userId);
      const now = new Date().toISOString();
      
      // We need to construct a full User object that matches our app's type definition
      const userToStore: User = {
        ...apiUser,
        username: apiUser.email.split('@')[0], // Create username from email as it's not in response
        phone: apiUser.phone || '',
        role: apiUser.role as UserRole, // Cast to our enum
        isActive: apiUser.isActive ?? true,
        lastLoginAt: now,
        updatedAt: now,
        createdAt: existingUserIndex > -1 ? mockUsers[existingUserIndex].createdAt : now,
        passwordHash: existingUserIndex > -1 ? mockUsers[existingUserIndex].passwordHash : 'from_api',
        passwordResetToken: null,
        tokenExpiryAt: null,
      };

      if (existingUserIndex > -1) {
        mockUsers[existingUserIndex] = userToStore;
      } else {
        mockUsers.push(userToStore);
      }

      // Set logged in user ID for other parts of the app that still use it
      localStorage.setItem('loggedInUserId', apiUser.userId);

      toast({
          title: t('login.success'),
          description: t('login.welcome_back', { name: apiUser.fullName }),
      });
      router.push('/');

    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('login.failure'),
        description: (error as Error).message || t('login.wrong_credentials'),
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-sm shadow-2xl">
      <CardHeader className="text-center p-6">
        <div className="flex justify-center items-center gap-2 mb-4">
            <Leaf className="h-8 w-8 text-primary" />
            <span className="font-headline text-3xl">{mockStores[0].name}</span>
        </div>
        <CardTitle className="font-headline text-2xl">{t('login.title')}</CardTitle>
        <CardDescription>{t('login.description')}</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="usernameOrEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('login.username')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('login.username_placeholder')} {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('login.password')}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder={t('login.password_placeholder')} {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full mt-2" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('login.submit')}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          {t('login.no_account')}{" "}
          <Link href="/register" className="underline hover:text-primary">
            {t('login.register_now')}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
