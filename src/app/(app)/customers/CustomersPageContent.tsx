
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  PlusCircle,
  MoreHorizontal,
  Search,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
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
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/store/LanguageContext';
import { useStore } from '@/store/StoreContext';
import { customerSchema } from '@/lib/form-schemas';
import { getCustomers, addCustomer, updateCustomer, deleteCustomer } from '@/services/api';
import type { Customer } from '@/types';

type CustomerFormValues = z.infer<typeof customerSchema>;

export default function CustomersPageContent() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddEditDialogOpen, setAddEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { store } = useStore();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      address: '',
      taxCode: '',
      customerType: 'Retail',
      note: '',
      creditLimit: 0,
      status: 'Active',
    },
  });

  const fetchCustomers = useCallback(async () => {
    if (!store) return;
    setIsLoading(true);
    try {
      const data = await getCustomers(store.storeId);
      setCustomers(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: 'Không thể tải danh sách khách hàng.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [store, toast, t]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setSelectedCustomer(null);
      setAddEditDialogOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isAddEditDialogOpen) {
      if (selectedCustomer) {
        form.reset({
          ...selectedCustomer,
          creditLimit: selectedCustomer.creditLimit || 0,
        });
      } else {
        form.reset({
          name: '', phone: '', email: '', address: '', taxCode: '', 
          customerType: 'Retail', note: '', creditLimit: 0, status: 'Active'
        });
      }
    }
  }, [isAddEditDialogOpen, selectedCustomer, form]);

  const handleAddNew = () => {
    setSelectedCustomer(null);
    setAddEditDialogOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setAddEditDialogOpen(true);
  };

  const handleDelete = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedCustomer && store) {
      try {
        await deleteCustomer(store.storeId, selectedCustomer.customerId);
        toast({ title: t('common.success'), description: t('pages.customers.success_delete') });
        fetchCustomers();
      } catch(error) {
        toast({ variant: 'destructive', title: t('common.error'), description: (error as Error).message });
      }
    }
    setDeleteDialogOpen(false);
    setSelectedCustomer(null);
  };

  const onSubmit = async (values: CustomerFormValues) => {
    if (!store) return;
    try {
      if (selectedCustomer) {
        await updateCustomer(store.storeId, selectedCustomer.customerId, values);
        toast({ title: t('common.success'), description: t('pages.customers.success_update') });
      } else {
        await addCustomer(store.storeId, values);
        toast({ title: t('common.success'), description: t('pages.customers.success_add') });
      }
      fetchCustomers();
      handleDialogChange(false);
    } catch (error) {
       toast({ variant: 'destructive', title: t('common.error'), description: (error as Error).message });
    }
  };

  const handleDialogChange = (open: boolean) => {
    setAddEditDialogOpen(open);
    if (!open) {
      router.replace('/customers', { scroll: false });
    }
  }

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer =>
        (customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [customers, searchTerm]);

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-headline">{t('pages.customers.title')}</CardTitle>
              <CardDescription>
                {t('pages.customers.description')}
              </CardDescription>
            </div>
            <div className='flex items-center gap-2'>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t('pages.customers.search_placeholder')}
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button size="sm" className="h-10 gap-1" onClick={handleAddNew}>
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  {t('pages.customers.add_button')}
                </span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('pages.customers.table_name')}</TableHead>
                <TableHead>{t('pages.customers.table_contact')}</TableHead>
                <TableHead className="hidden md:table-cell">{t('pages.customers.table_type')}</TableHead>
                <TableHead className="hidden md:table-cell text-right">{t('pages.customers.table_debt')}</TableHead>
                <TableHead>{t('pages.customers.table_status')}</TableHead>
                <TableHead>
                  <span className="sr-only">{t('common.actions')}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.customerId} onClick={() => router.push(`/customers/${customer.customerId}`)} className="cursor-pointer">
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>
                    <div className="font-medium">{customer.phone}</div>
                    <div className="hidden text-sm text-muted-foreground md:inline">
                      {customer.email}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{customer.customerType}</TableCell>
                  <TableCell className="hidden md:table-cell text-right">
                    <Badge variant={customer.totalDebt > 0 ? "destructive" : "outline"}>
                      {formatCurrency(customer.totalDebt)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={customer.status === 'Active' ? 'default' : 'secondary'}>{t(`status.${customer.status.toLowerCase()}`)}</Badge>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => handleEdit(customer)}>{t('common.edit')}</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleDelete(customer)} className="text-destructive">
                          {t('common.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            {t('pages.customers.showing_results', { count: filteredCustomers.length, total: customers.length })}
          </div>
        </CardFooter>
      </Card>
      
      <Dialog open={isAddEditDialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline">{selectedCustomer ? t('pages.customers.edit_dialog_title') : t('pages.customers.add_dialog_title')}</DialogTitle>
            <DialogDescription>
              {t('pages.customers.dialog_description')}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('pages.customers.form_name')}</FormLabel>
                    <FormControl><Input placeholder={t('pages.customers.form_name_placeholder')} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('pages.customers.form_phone')}</FormLabel>
                    <FormControl><Input placeholder={t('pages.customers.form_phone_placeholder')} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>{t('pages.customers.form_email')}</FormLabel>
                    <FormControl><Input type="email" placeholder={t('pages.customers.form_email_placeholder')} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>{t('pages.customers.form_address')}</FormLabel>
                    <FormControl><Textarea placeholder={t('pages.customers.form_address_placeholder')} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="taxCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('pages.customers.form_tax_code')}</FormLabel>
                    <FormControl><Input placeholder={t('pages.customers.form_tax_code_placeholder')} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="creditLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('pages.customers.form_credit_limit')}</FormLabel>
                    <FormControl><Input type="number" placeholder={t('pages.customers.form_credit_limit_placeholder')} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="customerType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('pages.customers.form_type')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder={t('pages.customers.form_type_placeholder')} /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Retail">{t('pages.customers.form_type_retail')}</SelectItem>
                          <SelectItem value="Wholesale">{t('pages.customers.form_type_wholesale')}</SelectItem>
                        </SelectContent>
                      </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('pages.customers.form_status')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder={t('pages.customers.form_status_placeholder')} /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Active">{t('pages.customers.form_status_active')}</SelectItem>
                          <SelectItem value="Inactive">{t('pages.customers.form_status_inactive')}</SelectItem>
                          <SelectItem value="Blocked">{t('pages.customers.form_status_blocked')}</SelectItem>
                        </SelectContent>
                      </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>{t('pages.customers.form_note')}</FormLabel>
                    <FormControl><Textarea placeholder={t('pages.customers.form_note_placeholder')} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="md:col-span-2">
                <Button type="submit">{t('common.save')}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.are_you_sure')}</AlertDialogTitle>
            <AlertDialogDescription dangerouslySetInnerHTML={{ __html: t('pages.customers.delete_dialog_description', { name: `<strong>"${selectedCustomer?.name}"</strong>` }) }} />
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
