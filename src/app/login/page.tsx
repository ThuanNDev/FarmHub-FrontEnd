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
import { mockUsers } from '@/lib/data';

const loginSchema = z.object({
  username: z.string().min(1, { message: 'Tên đăng nhập không được để trống.' }),
  password: z.string().min(1, { message: 'Mật khẩu không được để trống.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
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

        // In a real app, you would compare a hashed password. For this mock, we just check if the user exists and is active.
        if (user && user.is_active) {
        toast({
            title: 'Đăng nhập thành công',
            description: `Chào mừng quay trở lại, ${user.full_name}!`,
        });
        router.push('/');
        } else if (user && !user.is_active) {
            toast({
                variant: 'destructive',
                title: 'Đăng nhập thất bại',
                description: 'Tài khoản của bạn đã bị vô hiệu hóa.',
            });
            setIsLoading(false);
        } else {
        toast({
            variant: 'destructive',
            title: 'Đăng nhập thất bại',
            description: 'Tên đăng nhập hoặc mật khẩu không chính xác.',
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
            <span className="font-headline text-3xl">FarmHub</span>
        </div>
        <CardTitle className="font-headline text-2xl">Đăng nhập</CardTitle>
        <CardDescription>Nhập thông tin tài khoản của bạn để tiếp tục.</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên đăng nhập</FormLabel>
                  <FormControl>
                    <Input placeholder="ví dụ: admin" {...field} disabled={isLoading} />
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
                  <FormLabel>Mật khẩu</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 mt-2" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Đăng nhập
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="underline hover:text-primary">
            Đăng ký
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
