
'use client';

import { useEffect } from 'react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useStore } from '@/store/StoreContext';
import { mockBanks } from '@/lib/data';
import { settingsSchema } from '@/lib/form-schemas';

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const { store, setStore } = useStore();
  const { toast } = useToast();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      ...store,
      bankInfo: store.bankInfo || { bankId: '', accountNo: '', accountName: ''},
      isVatEnabled: store.isVatEnabled ?? true,
      vatRate: store.vatRate || 0,
      invoiceFooter: store.invoiceFooter || '',
      backupSchedule: store.backupSchedule || 'daily_2am',
      printingPreferences: store.printingPreferences || { defaultPaperSize: 'k80' },
      defaults: store.defaults || { unit: 'cái', discount: 0, shippingFee: 0 },
    },
  });

  useEffect(() => {
    form.reset({
        ...store,
        bankInfo: store.bankInfo || { bankId: '', accountNo: '', accountName: ''},
        isVatEnabled: store.isVatEnabled ?? true,
        vatRate: store.vatRate || 0,
        invoiceFooter: store.invoiceFooter || '',
        backupSchedule: store.backupSchedule || 'daily_2am',
        printingPreferences: store.printingPreferences || { defaultPaperSize: 'k80' },
        defaults: store.defaults || { unit: 'cái', discount: 0, shippingFee: 0 },
    });
  }, [store, form]);

  const onSubmit = (values: SettingsFormValues) => {
    const updatedSettings = { ...store, ...values };
    setStore(updatedSettings); 
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
              name="openingHours"
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

            <Separator />
            
            <div>
                <h3 className="text-lg font-medium font-headline">Cấu hình Hoá đơn &amp; VAT</h3>
                <p className="text-sm text-muted-foreground">
                    Thiết lập thuế suất và thông tin chân trang cho hóa đơn.
                </p>
            </div>
            
            <FormField
              control={form.control}
              name="isVatEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Áp dụng thuế VAT</FormLabel>
                    <FormDescription>
                      Bật/tắt tính thuế giá trị gia tăng (VAT) trên đơn hàng.
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="vatRate"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Thuế suất VAT (%)</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="8" {...field} />
                        </FormControl>
                        <FormDescription>
                            Nhập thuế suất VAT. Ví dụ: 8 cho 8%.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            
            <FormField
                control={form.control}
                name="invoiceFooter"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Chân trang hoá đơn</FormLabel>
                    <FormControl>
                        <Textarea placeholder="Cảm ơn quý khách và hẹn gặp lại!" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />

            <Separator />
            
            <div>
                <h3 className="text-lg font-medium font-headline">Cài đặt In ấn</h3>
                <p className="text-sm text-muted-foreground">
                    Chọn khổ giấy mặc định cho toàn bộ hệ thống.
                </p>
            </div>

            <FormField
                control={form.control}
                name="printingPreferences.defaultPaperSize"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Khổ giấy mặc định</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Chọn khổ giấy" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="k80">Giấy in nhiệt K80 (80mm)</SelectItem>
                            <SelectItem value="a5">Giấy A5</SelectItem>
                            <SelectItem value="k58">Giấy in nhiệt K58 (58mm)</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormDescription>
                        Lựa chọn này sẽ được áp dụng cho chức năng in hóa đơn.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
            />

            <Separator />
            
            <div>
                <h3 className="text-lg font-medium font-headline">Giá trị Mặc định</h3>
                <p className="text-sm text-muted-foreground">
                    Cấu hình các giá trị mặc định cho việc tạo đơn hàng.
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                    control={form.control}
                    name="defaults.unit"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Đơn vị mặc định</FormLabel>
                        <FormControl>
                            <Input placeholder="cái" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="defaults.discount"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Chiết khấu mặc định (VND)</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="defaults.shippingFee"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Phí vận chuyển mặc định (VND)</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <Separator />
            
            <div>
                <h3 className="text-lg font-medium font-headline">Thông tin thanh toán</h3>
                <p className="text-sm text-muted-foreground">
                    Cấu hình tài khoản ngân hàng để nhận thanh toán qua QR Code.
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="bankInfo.bankId"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Ngân hàng</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn ngân hàng" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {mockBanks.map((bank) => (
                                <SelectItem key={bank.bankId} value={bank.bankId}>
                                {bank.name}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="bankInfo.accountNo"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Số tài khoản</FormLabel>
                        <FormControl>
                            <Input placeholder="Nhập số tài khoản" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="bankInfo.accountName"
                    render={({ field }) => (
                        <FormItem className="md:col-span-2">
                        <FormLabel>Tên chủ tài khoản</FormLabel>
                        <FormControl>
                            <Input placeholder="Tên chủ tài khoản (viết hoa không dấu)" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            
            <Separator />

            <div>
                <h3 className="text-lg font-medium font-headline">Sao lưu Dữ liệu</h3>
                <p className="text-sm text-muted-foreground">
                    Cài đặt lịch sao lưu dữ liệu tự động. Dữ liệu sẽ được sao lưu trên server.
                </p>
            </div>
            
            <FormField
                control={form.control}
                name="backupSchedule"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Tần suất sao lưu</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Chọn tần suất" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="every_3_hours">Mỗi 3 giờ</SelectItem>
                            <SelectItem value="every_6_hours">Mỗi 6 giờ</SelectItem>
                            <SelectItem value="every_12_hours">Mỗi 12 giờ</SelectItem>
                            <SelectItem value="daily_2am">Hàng ngày (lúc 02:00 sáng)</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormDescription>
                        Đây là yêu cầu gửi tới backend. Việc sao lưu thực tế được thực hiện ở server.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
            />
            
            <Separator />
            
             <FormField
                control={form.control}
                name="isActive"
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
            <Button type="submit">Lưu thay đổi</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
