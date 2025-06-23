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
import { useLanguage } from '@/contexts/LanguageContext';

const loginSchema = z.object({
  username: z.string().min(1, { message: 'Tên đăng nhập không được để trống.' }),
  password: z.string().min(1, { message: 'Mật khẩu không được để trống.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    setIsLoading(true);
    // Mock authentication with a slight delay
    setTimeout(() => {
        const user = mockUsers.find((u) => u.username === values.username);

        // In a real app, you would compare a hashed password.
        if (user && user.is_active) {
            localStorage.setItem('loggedInUserId', user.id); // Save user ID

            if (user.last_login_at === null) {
                // First time login, redirect to OTP verification
                toast({
                    title: t('login.first_login_title'),
                    description: t('login.first_login_description'),
                });
                router.push(`/verify-otp?username=${values.username}`);
            } else {
                // Subsequent login
                user.last_login_at = new Date().toISOString();
                toast({
                    title: t('login.success'),
                    description: t('login.welcome_back', { name: user.full_name }),
                });
                router.push('/dashboard');
            }
        } else if (user && !user.is_active) {
            toast({
                variant: 'destructive',
                title: t('login.failure'),
                description: t('login.account_disabled'),
            });
            setIsLoading(false);
        } else {
        toast({
            variant: 'destructive',
            title: t('login.failure'),
            description: t('login.wrong_credentials'),
        });
        setIsLoading(false);
        }
    }, 1000);
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
              name="username"
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
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 mt-2" disabled={isLoading}>
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
