
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { otpSchema } from '@/lib/form-schemas';

type OtpFormValues = z.infer<typeof otpSchema>;

export default function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const username = searchParams.get('username');

  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  });
  
  React.useEffect(() => {
    if (!username) {
        toast({
            variant: 'destructive',
            title: 'Lỗi',
            description: 'Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.',
        });
        router.push('/login');
    }
  }, [username, router, toast]);


  const onSubmit = (values: OtpFormValues) => {
    setIsLoading(true);
    // Mock OTP verification with a slight delay
    setTimeout(() => {
      const user = mockUsers.find((u) => u.username === username);

      if (user) {
        // In a real app, you would verify the OTP against a backend service.
        // For this mock, any 6-digit code is considered valid.
        
        // Update lastLoginAt to prevent this page from showing again
        user.lastLoginAt = new Date().toISOString();

        toast({
          title: 'Xác thực thành công',
          description: `Chào mừng bạn đến với ${mockStores[0].name}, ${user.fullName}!`,
        });
        router.push('/dashboard');
      } else {
        toast({
          variant: 'destructive',
          title: 'Lỗi không mong muốn',
          description: 'Không thể xác thực người dùng. Vui lòng thử lại.',
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
        <CardTitle className="font-headline text-2xl">Xác thực tài khoản</CardTitle>
        <CardDescription>
          Đây là lần đăng nhập đầu tiên của bạn. Vui lòng nhập mã OTP được gửi đến email của bạn để tiếp tục.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã OTP</FormLabel>
                  <FormControl>
                    <Input placeholder="123456" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full mt-2" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xác nhận
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
