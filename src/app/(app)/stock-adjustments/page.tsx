'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PlusCircle, Search } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { mockStockAdjustments, mockProducts, mockUsers } from '@/lib/data';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronsUpDown } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

type StockAdjustment = typeof mockStockAdjustments[0];

const adjustmentSchema = z.object({
    productId: z.string().min(1, { message: "Vui lòng chọn một sản phẩm."}),
    adjustmentType: z.enum(['increase', 'decrease'], { required_error: 'Vui lòng chọn loại điều chỉnh.' }),
    quantityChange: z.coerce.number().int().positive({ message: "Số lượng phải là số nguyên dương."}),
    reason: z.string().min(1, { message: "Lý do không được để trống." }),
});

type AdjustmentFormValues = z.infer<typeof adjustmentSchema>;

export default function StockAdjustmentsPage() {
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>(mockStockAdjustments);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<AdjustmentFormValues>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: {
      productId: '',
      adjustmentType: 'decrease',
      quantityChange: 1,
      reason: '',
    },
  });

  const getProductName = (productId: string) => mockProducts.find(p => p.id === productId)?.name || 'N/A';

  const filteredAdjustments = useMemo(() => {
    if (!searchTerm) return adjustments;
    return adjustments.filter(adj => 
        getProductName(adj.product_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
        adj.reason.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, adjustments]);

  const onSubmit = (values: AdjustmentFormValues) => {
    const product = mockProducts.find(p => p.id === values.productId);
    if (!product) {
      toast({ variant: 'destructive', title: 'Lỗi', description: 'Không tìm thấy sản phẩm.' });
      return;
    }
    
    const quantity = values.adjustmentType === 'increase' ? values.quantityChange : -values.quantityChange;

    product.stock += quantity;

    const newAdjustment: StockAdjustment = {
      id: `adj-${Date.now()}`,
      product_id: values.productId,
      adjustment_type: values.adjustmentType,
      quantity_change: quantity,
      reason: values.reason,
      adjusted_by_user_id: mockUsers[0].id, // Mocked current user
      created_at: new Date().toISOString(),
    };
    
    mockStockAdjustments.unshift(newAdjustment);
    setAdjustments([...mockStockAdjustments]);

    toast({ title: 'Thành công', description: `Đã điều chỉnh tồn kho cho sản phẩm ${product.name}.` });
    setDialogOpen(false);
    form.reset();
  };
  
  const getUserName = (userId: string) => mockUsers.find(u => u.id === userId)?.full_name || 'N/A';
  const formatDate = (dateString: string) => new Date(dateString).toLocaleString('vi-VN');

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-headline">Điều chỉnh kho</CardTitle>
              <CardDescription>
                Ghi lại các thay đổi tồn kho không liên quan đến mua/bán.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Tìm theo sản phẩm, lý do..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button size="sm" className="h-10 gap-1 bg-accent hover:bg-accent/90" onClick={() => setDialogOpen(true)}>
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Tạo phiếu điều chỉnh
                    </span>
                </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày</TableHead>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead className="text-center">Số lượng</TableHead>
                <TableHead>Lý do</TableHead>
                <TableHead>Người thực hiện</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdjustments.map((adj) => (
                <TableRow key={adj.id}>
                  <TableCell>{formatDate(adj.created_at)}</TableCell>
                  <TableCell className="font-medium">{getProductName(adj.product_id)}</TableCell>
                  <TableCell>
                    <Badge variant={adj.adjustment_type === 'increase' ? 'default' : 'destructive'}>
                      {adj.adjustment_type === 'increase' ? 'Tăng' : 'Giảm'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-bold">{adj.quantity_change}</TableCell>
                  <TableCell>{adj.reason}</TableCell>
                  <TableCell>{getUserName(adj.adjusted_by_user_id)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Hiển thị <strong>{filteredAdjustments.length}</strong> trên <strong>{adjustments.length}</strong> phiếu điều chỉnh
          </div>
        </CardFooter>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline">Tạo phiếu điều chỉnh kho</DialogTitle>
            <DialogDescription>
              Chọn sản phẩm và nhập thông tin để điều chỉnh số lượng tồn kho.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sản phẩm</FormLabel>
                    <ProductCombobox field={field}/>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="adjustmentType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Loại điều chỉnh</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex items-center space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="decrease" />
                          </FormControl>
                          <FormLabel className="font-normal">Giảm (Hỏng, mất mát...)</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="increase" />
                          </FormControl>
                          <FormLabel className="font-normal">Tăng (Tìm thấy, nhập lại...)</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="quantityChange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số lượng</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lý do điều chỉnh</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ví dụ: Hàng hỏng do vận chuyển" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" className="bg-primary hover:bg-primary/90">Xác nhận</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}


function ProductCombobox({ field }: { field: any }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const availableProducts = useMemo(() => mockProducts.filter(p => p.is_active && !p.is_deleted), []);

    const filteredProducts = useMemo(() => {
        if (!search) return availableProducts;
        return availableProducts.filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.product_code.toLowerCase().includes(search.toLowerCase())
        );
    }, [search, availableProducts]);

    const selectedProduct = availableProducts.find(p => p.id === field.value);

    return (
         <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between font-normal"
                >
                    {selectedProduct ? selectedProduct.name : "Chọn hoặc tìm sản phẩm..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Input
                    placeholder="Tìm theo tên hoặc mã..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="m-2 w-[calc(100%-1rem)]"
                />
                <Separator />
                <ScrollArea className="h-72">
                    <div className="p-2 space-y-1">
                    {filteredProducts.length > 0 ? filteredProducts.map((product) => (
                        <Button
                            key={product.id}
                            variant="ghost"
                            className="w-full justify-start font-normal h-auto py-2 text-left"
                            onClick={() => {
                                field.onChange(product.id);
                                setSearch('');
                                setOpen(false);
                            }}
                        >
                            <div>
                                <div>{product.name}</div>
                                <div className="text-xs text-muted-foreground">{product.product_code}</div>
                            </div>
                        </Button>
                    )) : <p className="p-2 text-center text-sm text-muted-foreground">Không tìm thấy sản phẩm.</p>}
                    </div>
                </ScrollArea>
            </PopoverContent>
        </Popover>
    )
}
