
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MoreHorizontal, PlusCircle, Search, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { mockReturnOrders, mockReturnOrderItems, mockOrders, mockOrderItems, mockCustomers, mockProducts, mockUsers } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';

type ReturnOrder = typeof mockReturnOrders[0];
type Order = typeof mockOrders[0];
type OrderItem = typeof mockOrderItems[0];

interface ReturnableItem extends OrderItem {
  return_quantity: number;
  condition: 'new' | 'used' | 'damaged';
}

const returnOrderSchema = z.object({
  reason: z.string().optional(),
});

type ReturnOrderFormValues = z.infer<typeof returnOrderSchema>;

export default function ReturnsPage() {
  const [returnOrders, setReturnOrders] = useState<ReturnOrder[]>(mockReturnOrders);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [orderCode, setOrderCode] = useState('');
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [returnableItems, setReturnableItems] = useState<ReturnableItem[]>([]);

  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const form = useForm<ReturnOrderFormValues>({
    resolver: zodResolver(returnOrderSchema),
  });

  const getCustomerName = (customerId: string) => mockCustomers.find(c => c.id === customerId)?.name || 'N/A';

  const filteredROs = useMemo(() => {
    if (!searchTerm) return returnOrders;
    return returnOrders.filter(ro => {
        const order = mockOrders.find(o => o.id === ro.order_id);
        return ro.id.slice(-6).toLowerCase().includes(searchTerm.toLowerCase()) ||
               (order && order.order_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
               getCustomerName(ro.customer_id).toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [searchTerm, returnOrders]);


  const handleSearchOrder = () => {
    const order = mockOrders.find(o => o.order_code.toLowerCase() === orderCode.toLowerCase());
    if (order) {
      setFoundOrder(order);
      const items = mockOrderItems
        .filter(item => item.order_id === order.id)
        .map(item => ({ ...item, return_quantity: 0, condition: 'new' as const }));
      setReturnableItems(items);
    } else {
      toast({ variant: 'destructive', title: 'Không tìm thấy', description: `Không tìm thấy đơn hàng với mã ${orderCode}.`});
      setFoundOrder(null);
      setReturnableItems([]);
    }
  };
  
  const handleItemQuantityChange = (itemId: string, quantity: number) => {
    setReturnableItems(prev => prev.map(item => {
        if(item.id === itemId) {
            const originalItem = mockOrderItems.find(oi => oi.id === itemId);
            const maxQty = originalItem?.quantity || 0;
            const newQty = Math.max(0, Math.min(quantity, maxQty));
            return { ...item, return_quantity: newQty };
        }
        return item;
    }));
  };
  
  const handleItemConditionChange = (itemId: string, condition: 'new' | 'used' | 'damaged') => {
    setReturnableItems(prev => prev.map(item => item.id === itemId ? { ...item, condition } : item));
  }

  const onSubmit = (values: ReturnOrderFormValues) => {
    if (!foundOrder) return;
    
    const itemsToReturn = returnableItems.filter(item => item.return_quantity > 0);
    if(itemsToReturn.length === 0) {
        toast({ variant: 'destructive', title: 'Lỗi', description: 'Vui lòng chọn ít nhất một sản phẩm để trả.'});
        return;
    }

    const totalRefundAmount = itemsToReturn.reduce((sum, item) => sum + item.return_quantity * item.unit_price, 0);
    const now = new Date().toISOString();
    const currentUser = mockUsers[0];

    const newReturnOrder: ReturnOrder = {
        id: `ret-${Date.now()}`,
        order_id: foundOrder.id,
        customer_id: foundOrder.customer_id,
        return_date: now,
        total_refund_amount: totalRefundAmount,
        reason: values.reason || null,
        status: 'pending',
        processed_by_user_id: currentUser.id,
        created_at: now,
        updated_at: now,
    };
    mockReturnOrders.unshift(newReturnOrder);

    itemsToReturn.forEach(item => {
        mockReturnOrderItems.push({
            id: `item-ret-${Date.now()}-${item.id}`,
            return_order_id: newReturnOrder.id,
            product_id: item.product_id,
            quantity: item.return_quantity,
            unit_price: item.unit_price,
            condition: item.condition,
            restocked: false,
        });
    });

    toast({ title: "Thành công", description: "Đã tạo đơn trả hàng thành công." });
    setReturnOrders([...mockReturnOrders]);
    setCreateDialogOpen(false);
    setFoundOrder(null);
    setReturnableItems([]);
    setOrderCode('');
  };
  
  const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  const formatDate = (dateString: string | null) => dateString ? format(new Date(dateString), 'dd/MM/yyyy') : 'N/A';
  
  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'refunded':
      case 'restocked':
      case 'approved':
        return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-headline">Quản lý trả hàng</CardTitle>
              <CardDescription>
                Theo dõi và xử lý các yêu cầu trả hàng từ khách.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm theo mã, đơn gốc, KH..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button size="sm" className="h-10 gap-1 bg-accent hover:bg-accent/90" onClick={() => setCreateDialogOpen(true)}>
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Tạo đơn trả hàng
                </span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã trả hàng</TableHead>
                <TableHead>Đơn gốc</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Ngày trả</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Tổng tiền hoàn</TableHead>
                <TableHead>
                  <span className="sr-only">Hành động</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredROs.map((ro) => (
                <TableRow key={ro.id} onClick={() => router.push(`/returns/${ro.id}`)} className="cursor-pointer">
                  <TableCell className="font-medium">#{ro.id.slice(-6)}</TableCell>
                  <TableCell>{mockOrders.find(o => o.id === ro.order_id)?.order_code || 'N/A'}</TableCell>
                  <TableCell>{getCustomerName(ro.customer_id)}</TableCell>
                  <TableCell>{formatDate(ro.return_date)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(ro.status)}>{t(`status.${ro.status.toLowerCase()}`)}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(ro.total_refund_amount)}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => router.push(`/returns/${ro.id}`)}>
                          Xem chi tiết & Xử lý
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
                Hiển thị <strong>{filteredROs.length}</strong> trên <strong>{returnOrders.length}</strong> đơn trả hàng
            </div>
        </CardFooter>
      </Card>
      
      <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
                <DialogTitle className="font-headline">Tạo đơn trả hàng</DialogTitle>
                <DialogDescription>
                    Tìm đơn hàng gốc và chọn sản phẩm khách muốn trả lại.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                <div className="flex items-center gap-2">
                    <Input 
                        placeholder="Nhập mã đơn hàng gốc (ví dụ: DH20240725001)" 
                        value={orderCode}
                        onChange={e => setOrderCode(e.target.value)}
                    />
                    <Button onClick={handleSearchOrder}><Search className="mr-2 h-4 w-4"/> Tìm</Button>
                </div>

                {foundOrder && (
                     <Card>
                        <CardHeader>
                            <CardTitle>Chi tiết đơn hàng {foundOrder.order_code}</CardTitle>
                            <CardDescription>
                                Khách hàng: {getCustomerName(foundOrder.customer_id)} | Ngày mua: {formatDate(foundOrder.created_at)}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                     <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Sản phẩm</TableHead>
                                                <TableHead>Đã mua</TableHead>
                                                <TableHead>Số lượng trả</TableHead>
                                                <TableHead>Tình trạng</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {returnableItems.map(item => (
                                                <TableRow key={item.id}>
                                                    <TableCell>{item.product_name}</TableCell>
                                                    <TableCell>{item.quantity}</TableCell>
                                                    <TableCell>
                                                        <Input 
                                                            type="number" 
                                                            className="w-20" 
                                                            max={item.quantity}
                                                            min={0}
                                                            value={item.return_quantity}
                                                            onChange={(e) => handleItemQuantityChange(item.id, parseInt(e.target.value) || 0)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                         <Select value={item.condition} onValueChange={(val: 'new' | 'used' | 'damaged') => handleItemConditionChange(item.id, val)}>
                                                            <SelectTrigger className="w-[120px]">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="new">Mới</SelectItem>
                                                                <SelectItem value="used">Đã dùng</SelectItem>
                                                                <SelectItem value="damaged">Hư hỏng</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    <Separator />
                                     <FormField
                                        control={form.control}
                                        name="reason"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Lý do trả hàng</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Ví dụ: Sản phẩm lỗi, không đúng mẫu..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <DialogFooter>
                                        <Button type="submit" className="bg-primary hover:bg-primary/90">Tạo đơn trả hàng</Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        </CardContent>
                     </Card>
                )}
            </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
