
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Leaf, Save } from 'lucide-react';

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
import { storeSchema } from '@/lib/form-schemas';
import { mockBanks, mockUsers } from '@/lib/data';
import { useLanguage } from '@/store/LanguageContext';
import { addStore } from '@/services/api';
import type { Store } from '@/types';

type StoreFormValues = z.infer<typeof storeSchema>;

export default function CreateStorePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();

  const form = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: '',
      address: '',
      phone: '',
      email: '',
      databaseName: '',
      managerId: '',
      openingHours: 'Thứ 2 - Chủ Nhật: 7:00 - 18:00',
      isActive: true,
      bankInfo: { bankId: '', accountNo: '', accountName: ''},
      isVatEnabled: false,
      vatRate: 0,
      invoiceFooter: 'Cảm ơn quý khách và hẹn gặp lại!',
      printingPreferences: { defaultPaperSize: 'k80' },
      backupSchedule: 'daily_2am',
      defaults: { unit: 'cái', discount: 0, shippingFee: 0 },
    },
  });

  const onSubmit = async (values: StoreFormValues) => {
    try {
      await addStore(values);
      toast({
        title: t('common.success'),
        description: t('pages.create_store.success_message'),
      });
      router.push('/super-admin');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: (error as Error).message || t('pages.create_store.error_message'),
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
            <Leaf /> {t('pages.create_store.title')}
        </CardTitle>
        <CardDescription>
          {t('pages.create_store.description')}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <h3 className="text-lg font-medium font-headline">{t('pages.create_store.section_basic')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>{t('pages.create_store.form.name')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem><FormLabel>{t('pages.create_store.form.phone')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
            </div>
            <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem><FormLabel>{t('pages.create_store.form.address')}</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>{t('pages.create_store.form.email')}</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="openingHours" render={({ field }) => (
                <FormItem><FormLabel>{t('pages.create_store.form.opening_hours')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>

            <Separator />
            {/* Technical Info */}
            <h3 className="text-lg font-medium font-headline">{t('pages.create_store.section_technical')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="databaseName" render={({ field }) => (
                    <FormItem><FormLabel>{t('pages.create_store.form.database_name')}</FormLabel><FormControl><Input {...field} /></FormControl><FormDescription>{t('pages.create_store.form.database_name_desc')}</FormDescription><FormMessage /></FormItem>
                )}/>
                 <FormField control={form.control} name="managerId" render={({ field }) => (
                    <FormItem><FormLabel>{t('pages.create_store.form.manager')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder={t('pages.create_store.form.manager_placeholder')} /></SelectTrigger></FormControl>
                        <SelectContent>{mockUsers.filter(u => u.role === 'store_manager').map((user) => (
                            <SelectItem key={user.userId} value={user.userId}>{user.fullName}</SelectItem>
                        ))}</SelectContent>
                    </Select><FormMessage /></FormItem>
                )}/>
            </div>

            <Separator />
            {/* Payment Info */}
            <h3 className="text-lg font-medium font-headline">{t('pages.create_store.section_payment')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="bankInfo.bankId" render={({ field }) => (
                    <FormItem><FormLabel>{t('pages.create_store.form.bank')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder={t('pages.create_store.form.bank_placeholder')} /></SelectTrigger></FormControl>
                        <SelectContent>{mockBanks.map((bank) => (
                            <SelectItem key={bank.bankId} value={bank.bankId}>{bank.name}</SelectItem>
                        ))}</SelectContent>
                    </Select><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="bankInfo.accountNo" render={({ field }) => (
                    <FormItem><FormLabel>{t('pages.create_store.form.account_no')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="bankInfo.accountName" render={({ field }) => (
                    <FormItem className="md:col-span-2"><FormLabel>{t('pages.create_store.form.account_name')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
            </div>
            
            <Separator />
             {/* VAT & Invoice */}
            <h3 className="text-lg font-medium font-headline">{t('pages.create_store.section_invoice')}</h3>
             <FormField control={form.control} name="isVatEnabled" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5"><FormLabel>{t('pages.create_store.form.is_vat_enabled')}</FormLabel><FormDescription>{t('pages.create_store.form.is_vat_enabled_desc')}</FormDescription></div>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )}/>
            <FormField control={form.control} name="vatRate" render={({ field }) => (
                <FormItem><FormLabel>{t('pages.create_store.form.vat_rate')}</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="invoiceFooter" render={({ field }) => (
                <FormItem><FormLabel>{t('pages.create_store.form.invoice_footer')}</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
            )}/>

             <Separator />
             {/* Other Settings */}
            <h3 className="text-lg font-medium font-headline">{t('pages.create_store.section_other')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="printingPreferences.defaultPaperSize" render={({ field }) => (
                    <FormItem><FormLabel>{t('pages.create_store.form.paper_size')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="k80">{t('pages.create_store.form.paper_k80')}</SelectItem>
                            <SelectItem value="a5">{t('pages.create_store.form.paper_a5')}</SelectItem>
                            <SelectItem value="k58">{t('pages.create_store.form.paper_k58')}</SelectItem>
                        </SelectContent>
                    </Select><FormMessage /></FormItem>
                )}/>
                 <FormField control={form.control} name="backupSchedule" render={({ field }) => (
                    <FormItem><FormLabel>{t('pages.create_store.form.backup_schedule')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="daily_2am">{t('pages.create_store.form.backup_daily')}</SelectItem>
                            <SelectItem value="every_12_hours">{t('pages.create_store.form.backup_12h')}</SelectItem>
                        </SelectContent>
                    </Select><FormMessage /></FormItem>
                )}/>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                {t('pages.create_store.submit_button')}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
