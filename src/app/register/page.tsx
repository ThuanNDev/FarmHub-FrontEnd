
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
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

const registerSchema = z.object({
  full_name: z.string().min(1, { message: 'Họ tên không được để trống.' }),
  username: z.string().min(3, { message: 'Tên đăng nhập phải có ít nhất 3 ký tự.' }),
  email: z.string().email({ message: 'Email không hợp lệ.' }),
  password: z.string().min(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự.' }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Mật khẩu không khớp.",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (values: RegisterFormValues) => {
    setIsLoading(true);
    setTimeout(() => {
        const userExists = mockUsers.some(
            (u) => u.username === values.username || u.email === values.email
        );

        if (userExists) {
            toast({
                variant: 'destructive',
                title: 'Đăng ký thất bại',
                description: 'Tên đăng nhập hoặc email đã tồn tại.',
            });
            setIsLoading(false);
            return;
        }

        const now = new Date().toISOString();
        const newUser: (typeof mockUsers)[0] = {
            UserId: `user-${Math.floor(1000 + Math.random() * 9000)}`,
            username: values.username,
            password_hash: `hashed_${values.password}`, // Mock hashing
            full_name: values.full_name,
            email: values.email,
            phone: '',
            role: 'Staff' as const,
            AssociatedStoreIds: ['store-001'],
            is_active: true,
            is_superadmin: false,
            last_login_at: null,
            created_at: now,
            updated_at: now,
            password_reset_token: null,
            token_expiry_at: null,
        };
        
        // This adds the user to the array in memory for the current session.
        // It does not modify the source file.
        mockUsers.push(newUser);

        toast({
            title: 'Đăng ký thành công!',
            description: 'Tài khoản của bạn đã được tạo. Vui lòng đăng nhập.',
        });
        router.push('/login');

    }, 1000);
  };

  return (
    <Card className="w-full max-w-md shadow-2xl">
      <CardHeader className="text-center p-6">
        <div className="flex justify-center items-center gap-2 mb-4">
            <Leaf className="h-8 w-8 text-primary" />
            <span className="font-headline text-3xl">{mockStores[0].name}</span>
        </div>
        <CardTitle className="font-headline text-2xl">Tạo tài khoản</CardTitle>
        <CardDescription>Điền thông tin của bạn để bắt đầu.</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ và tên</FormLabel>
                  <FormControl>
                    <Input placeholder="Nguyễn Văn A" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên đăng nhập</FormLabel>
                  <FormControl>
                    <Input placeholder="nguyenvana" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="a@example.com" {...field} disabled={isLoading} />
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
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Xác nhận mật khẩu</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 mt-2" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Đăng ký
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
            Đã có tài khoản?{" "}
            <Link href="/login" className="underline hover:text-primary">
                Đăng nhập ngay
            </Link>
        </div>
      </CardContent>
    </Card>
  );
}
