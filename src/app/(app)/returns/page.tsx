
'use client';

import { useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MoreHorizontal, PlusCircle, Search, Trash2, Camera, Sparkles, Loader2 } from 'lucide-react';
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
import { mockReturnOrders, mockReturnOrderItems, mockOrders, mockOrderItems, mockCustomers, mockUsers } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/store/LanguageContext';
import { format } from 'date-fns';
import { returnOrderSchema } from '@/lib/form-schemas';
import { analyzeReturnImage } from '@/ai/flows/analyze-return-image';

type ReturnOrder = typeof mockReturnOrders[0];
type Order = typeof mockOrders[0];
type OrderItem = typeof mockOrderItems[0];

interface ReturnableItem extends OrderItem {
  returnQuantity: number;
  condition: 'new' | 'used' | 'damaged';
  imageFile?: File | null;
  analyzing: boolean;
}
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

  const getCustomerName = (customerId: string) => mockCustomers.find(c => c.customerId === customerId)?.name || 'N/A';

  const filteredROs = useMemo(() => {
    if (!searchTerm) return returnOrders;
    return returnOrders.filter(ro => {
        const order = mockOrders.find(o => o.orderId === ro.orderId);
        return ro.returnOrderId.slice(-6).toLowerCase().includes(searchTerm.toLowerCase()) ||
               (order && order.orderCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
               getCustomerName(ro.customerId).toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [searchTerm, returnOrders]);


  const handleSearchOrder = () => {
    const order = mockOrders.find(o => o.orderCode.toLowerCase() === orderCode.toLowerCase());
    if (order) {
      setFoundOrder(order);
      const items = mockOrderItems
        .filter(item => item.orderId === order.orderId)
        .map(item => ({ ...item, returnQuantity: 0, condition: 'new' as const, imageFile: null, analyzing: false }));
      setReturnableItems(items);
    } else {
      toast({ variant: 'destructive', title: 'Không tìm thấy', description: `Không tìm thấy đơn hàng với mã ${orderCode}.`});
      setFoundOrder(null);
      setReturnableItems([]);
    }
  };
  
  const handleItemQuantityChange = (itemId: string, quantity: number) => {
    setReturnableItems(prev => prev.map(item => {
        if(item.orderItemId === itemId) {
            const originalItem = mockOrderItems.find(oi => oi.orderItemId === itemId);
            const maxQty = originalItem?.quantity || 0;
            const newQty = Math.max(0, Math.min(quantity, maxQty));
            return { ...item, returnQuantity: newQty };
        }
        return item;
    }));
  };
  
  const handleItemConditionChange = (itemId: string, condition: 'new' | 'used' | 'damaged') => {
    setReturnableItems(prev => prev.map(item => item.orderItemId === itemId ? { ...item, condition } : item));
  }

  const handleImageFileChange = (itemId: string, file: File | null) => {
    setReturnableItems(prev => prev.map(item => item.orderItemId === itemId ? { ...item, imageFile: file } : item));
  };
  
  const handleAnalyzeImage = async (itemId: string) => {
    const item = returnableItems.find(i => i.orderItemId === itemId);
    if (!item || !item.imageFile) {
        toast({ variant: 'destructive', title: 'Lỗi', description: 'Vui lòng chọn ảnh trước khi phân tích.' });
        return;
    }

    setReturnableItems(prev => prev.map(i => i.orderItemId === itemId ? { ...i, analyzing: true } : i));

    try {
        const reader = new FileReader();
        reader.readAsDataURL(item.imageFile);
        reader.onload = async () => {
            const dataUri = reader.result as string;
            const result = await analyzeReturnImage({ photoDataUri: dataUri });
            
            handleItemConditionChange(itemId, result.condition);
            
            // Optionally update a reason/note field if you add one
            toast({ title: 'Phân tích hoàn tất', description: `AI đề xuất tình trạng: ${t(`status.${result.condition}`)}. Lý do: ${result.reason}` });

        };
        reader.onerror = (error) => {
            throw error;
        };
    } catch (error) {
        console.error("Image analysis failed:", error);
        toast({ variant: 'destructive', title: 'Lỗi', description: 'Phân tích hình ảnh thất bại. Vui lòng thử lại.' });
    } finally {
        setReturnableItems(prev => prev.map(i => i.orderItemId === itemId ? { ...i, analyzing: false } : i));
    }
  };

  const onSubmit = (values: ReturnOrderFormValues) => {
    if (!foundOrder) return;
    
    const itemsToReturn = returnableItems.filter(item => item.returnQuantity > 0);
    if(itemsToReturn.length === 0) {
        toast({ variant: 'destructive', title: 'Lỗi', description: 'Vui lòng chọn ít nhất một sản phẩm để trả.'});
        return;
    }

    const totalRefundAmount = itemsToReturn.reduce((sum, item) => sum + item.returnQuantity * item.unitPrice, 0);
    const now = new Date().toISOString();
    const currentUser = mockUsers[0];

    const newReturnOrder: ReturnOrder = {
        returnOrderId: `ret-${Date.now()}`,
        orderId: foundOrder.orderId,
        customerId: foundOrder.customerId,
        returnDate: now,
        totalRefundAmount: totalRefundAmount,
        reason: values.reason || null,
        status: 'pending',
        processedByUserId: currentUser.userId,
        createdAt: now,
        updatedAt: now,
    };
    mockReturnOrders.unshift(newReturnOrder);

    itemsToReturn.forEach(item => {
        mockReturnOrderItems.push({
            returnOrderItemId: `item-ret-${Date.now()}-${item.orderItemId}`,
            returnOrderId: newReturnOrder.returnOrderId,
            productId: item.productId,
            quantity: item.returnQuantity,
            unitPrice: item.unitPrice,
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
              <Button size="sm" className="h-10 gap-1" onClick={() => setCreateDialogOpen(true)}>
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
                <TableRow key={ro.returnOrderId} onClick={() => router.push(`/returns/${ro.returnOrderId}`)} className="cursor-pointer">
                  <TableCell className="font-medium">#{ro.returnOrderId.slice(-6)}</TableCell>
                  <TableCell>{mockOrders.find(o => o.orderId === ro.orderId)?.orderCode || 'N/A'}</TableCell>
                  <TableCell>{getCustomerName(ro.customerId)}</TableCell>
                  <TableCell>{formatDate(ro.returnDate)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(ro.status)}>{t(`status.${ro.status.toLowerCase()}`)}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(ro.totalRefundAmount)}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => router.push(`/returns/${ro.returnOrderId}`)}>
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
        <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
                <DialogTitle className="font-headline">Tạo đơn trả hàng</DialogTitle>
                <DialogDescription>
                    Tìm đơn hàng gốc và chọn sản phẩm khách muốn trả lại.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                <div className="flex items-center gap-2">
                    <Input 
                        placeholder="Nhập mã đơn hàng gốc (ví dụ: DH...)" 
                        value={orderCode}
                        onChange={e => setOrderCode(e.target.value)}
                    />
                    <Button onClick={handleSearchOrder}><Search className="mr-2 h-4 w-4"/> Tìm</Button>
                </div>

                {foundOrder && (
                     <Card>
                        <CardHeader>
                            <CardTitle>Chi tiết đơn hàng {foundOrder.orderCode}</CardTitle>
                            <CardDescription>
                                Khách hàng: {getCustomerName(foundOrder.customerId)} | Ngày mua: {formatDate(foundOrder.createdAt)}
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
                                                <TableHead>SL Trả</TableHead>
                                                <TableHead>Ảnh</TableHead>
                                                <TableHead>Tình trạng</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {returnableItems.map(item => (
                                                <TableRow key={item.orderItemId}>
                                                    <TableCell>{item.productName}</TableCell>
                                                    <TableCell>{item.quantity}</TableCell>
                                                    <TableCell>
                                                        <Input 
                                                            type="number" 
                                                            className="w-16" 
                                                            max={item.quantity}
                                                            min={0}
                                                            value={item.returnQuantity}
                                                            onChange={(e) => handleItemQuantityChange(item.orderItemId, parseInt(e.target.value) || 0)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Button asChild variant="outline" size="icon" className="h-8 w-8 relative">
                                                                <label>
                                                                    <Camera className="h-4 w-4"/>
                                                                    <input type="file" accept="image/*" className="sr-only" onChange={(e) => handleImageFileChange(item.orderItemId, e.target.files ? e.target.files[0] : null)} />
                                                                </label>
                                                            </Button>
                                                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleAnalyzeImage(item.orderItemId)} disabled={!item.imageFile || item.analyzing}>
                                                                {item.analyzing ? <Loader2 className="h-4 w-4 animate-spin"/> : <Sparkles className="h-4 w-4 text-primary"/>}
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                         <Select value={item.condition} onValueChange={(val: 'new' | 'used' | 'damaged') => handleItemConditionChange(item.orderItemId, val)}>
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
                                        <Button type="submit">Tạo đơn trả hàng</Button>
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
