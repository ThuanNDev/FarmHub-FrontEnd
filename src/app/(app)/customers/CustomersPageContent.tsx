
'use client';

import { useState, useEffect } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { mockCustomers } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/store/LanguageContext';
import { customerSchema } from '@/lib/form-schemas';

type Customer = typeof mockCustomers[0];
type CustomerFormValues = z.infer<typeof customerSchema>;

export default function CustomersPageContent() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddEditDialogOpen, setAddEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { t } = useLanguage();

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

  const confirmDelete = () => {
    if (selectedCustomer) {
      setCustomers(customers.map(c => c.customerId === selectedCustomer.customerId ? { ...c, isDeleted: true } : c));
      toast({ title: "Thành công", description: "Khách hàng đã được xóa." });
    }
    setDeleteDialogOpen(false);
    setSelectedCustomer(null);
  };

  const onSubmit = (values: CustomerFormValues) => {
    const now = new Date().toISOString();
    if (selectedCustomer) {
      const updatedCustomers = customers.map(c => 
        c.customerId === selectedCustomer.customerId 
          ? { 
              ...c, 
              ...values, 
              updatedAt: now,
              creditLimit: values.creditLimit || null,
              address: values.address || null,
              taxCode: values.taxCode || null,
              note: values.note || null,
            } 
          : c
      );
      setCustomers(updatedCustomers);
      toast({ title: "Thành công", description: "Khách hàng đã được cập nhật." });
    } else {
      const newCustomer: Customer = {
        customerId: `cust-${Math.floor(1000 + Math.random() * 9000)}`,
        ...values,
        totalDebt: 0,
        debtDueDate: null,
        lastPurchaseDate: null,
        loyaltyPoints: 0,
        loyaltyTier: 'Bronze',
        createdAt: now,
        updatedAt: now,
        isDeleted: false,
        creditLimit: values.creditLimit || null,
        address: values.address || null,
        taxCode: values.taxCode || null,
        note: values.note || null,
      };
      setCustomers([newCustomer, ...customers]);
      toast({ title: "Thành công", description: "Khách hàng mới đã được thêm." });
    }
    handleDialogChange(false);
  };

  const handleDialogChange = (open: boolean) => {
    setAddEditDialogOpen(open);
    if (!open) {
      router.replace('/customers', { scroll: false });
    }
  }

  const filteredCustomers = customers.filter(customer =>
    !customer.isDeleted &&
    (customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
     customer.phone.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
              <CardTitle className="font-headline">Khách hàng</CardTitle>
              <CardDescription>
                Quản lý khách hàng và lịch sử mua hàng của họ.
              </CardDescription>
            </div>
            <div className='flex items-center gap-2'>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm khách hàng..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button size="sm" className="h-10 gap-1" onClick={handleAddNew}>
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Thêm khách hàng
                </span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên</TableHead>
                <TableHead>Liên hệ</TableHead>
                <TableHead className="hidden md:table-cell">Loại</TableHead>
                <TableHead className="hidden md:table-cell text-right">Tổng nợ</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
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
                        <DropdownMenuItem onSelect={() => handleEdit(customer)}>Sửa</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleDelete(customer)} className="text-destructive">
                          Xóa
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
            Hiển thị <strong>{filteredCustomers.length}</strong> trên <strong>{customers.filter(c => !c.isDeleted).length}</strong> khách hàng
          </div>
        </CardFooter>
      </Card>
      
      <Dialog open={isAddEditDialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline">{selectedCustomer ? 'Sửa khách hàng' : 'Thêm khách hàng mới'}</DialogTitle>
            <DialogDescription>
              Điền thông tin chi tiết của khách hàng.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên khách hàng</FormLabel>
                    <FormControl><Input placeholder="Nguyễn Văn A" {...field} /></FormControl>
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
                    <FormControl><Input placeholder="0901234567" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" placeholder="nguyenvana@example.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Địa chỉ</FormLabel>
                    <FormControl><Textarea placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="taxCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã số thuế</FormLabel>
                    <FormControl><Input placeholder="Tùy chọn" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="creditLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hạn mức công nợ</FormLabel>
                    <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="customerType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại khách hàng</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Chọn loại khách" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Retail">Khách lẻ</SelectItem>
                          <SelectItem value="Wholesale">Khách sỉ</SelectItem>
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
                    <FormLabel>Trạng thái</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Chọn trạng thái" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Active">{t('status.active')}</SelectItem>
                          <SelectItem value="Inactive">{t('status.inactive')}</SelectItem>
                          <SelectItem value="Blocked">{t('status.blocked')}</SelectItem>
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
                    <FormLabel>Ghi chú</FormLabel>
                    <FormControl><Textarea placeholder="Thông tin thêm về khách hàng..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="md:col-span-2">
                <Button type="submit">Lưu khách hàng</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn không?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Thao tác này sẽ xóa vĩnh viễn khách hàng
               <strong> "{selectedCustomer?.name}"</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

    
