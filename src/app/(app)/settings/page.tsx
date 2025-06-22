'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { mockStores } from '@/lib/data';

type Store = (typeof mockStores)[0];

const settingsSchema = z.object({
  name: z.string().min(1, "Tên cửa hàng không được để trống."),
  address: z.string().min(1, "Địa chỉ không được để trống."),
  phone: z.string().min(1, "Số điện thoại không được để trống."),
  email: z.string().email("Email không hợp lệ."),
  opening_hours: z.string().optional(),
  is_active: z.boolean().default(true),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const [storeSettings, setStoreSettings] = useState<Store>(mockStores[0]);
  const { toast } = useToast();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: storeSettings.name,
      address: storeSettings.address,
      phone: storeSettings.phone,
      email: storeSettings.email,
      opening_hours: storeSettings.opening_hours,
      is_active: storeSettings.is_active,
    },
  });

  useEffect(() => {
    form.reset(storeSettings);
  }, [storeSettings, form]);

  const onSubmit = (values: SettingsFormValues) => {
    const updatedSettings = { ...storeSettings, ...values };
    setStoreSettings(updatedSettings);
    mockStores[0] = updatedSettings; 
    toast({
      title: "Thành công",
      description: "Cài đặt cửa hàng đã được cập nhật.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Cài đặt Cửa hàng</CardTitle>
        <CardDescription>
          Quản lý thông tin cơ bản và cấu hình cho cửa hàng của bạn.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên cửa hàng</FormLabel>
                      <FormControl>
                        <Input placeholder="FarmHub chi nhánh trung tâm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số điện thoại</FormLabel>
                      <FormControl>
                        <Input placeholder="0123456789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
             <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                        <Input type="email" placeholder="contact@farmhub.com" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Địa chỉ</FormLabel>
                  <FormControl>
                    <Textarea placeholder="123 Đường ABC, Phường XYZ, Quận 1, TP.HCM" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="opening_hours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giờ mở cửa</FormLabel>
                  <FormControl>
                    <Input placeholder="Thứ 2 - Chủ Nhật: 7:00 - 18:00" {...field} />
                  </FormControl>
                  <FormDescription>
                    Hiển thị thông tin giờ làm việc của cửa hàng.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                    <div className="space-y-0.5">
                    <FormLabel>Trạng thái cửa hàng</FormLabel>
                    <FormDescription>
                        Cửa hàng đang hoạt động và có thể giao dịch.
                    </FormDescription>
                    </div>
                    <FormControl>
                    <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                    />
                    </FormControl>
                </FormItem>
                )}
            />
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit" className="bg-primary hover:bg-primary/90">Lưu thay đổi</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
