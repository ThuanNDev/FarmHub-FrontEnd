

'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MoreHorizontal, PlusCircle, Trash2, ChevronsUpDown, Printer } from 'lucide-react';
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { mockPurchaseOrders, mockPurchaseOrderItems, mockSuppliers, mockProducts, mockUsers, mockStores } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type PurchaseOrder = (typeof mockPurchaseOrders)[0];
type PurchaseOrderItem = {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
};

const purchaseOrderSchema = z.object({
  supplier_id: z.string().min(1, 'Vui lòng chọn nhà cung cấp.'),
  expected_delivery_date: z.date().optional(),
  note: z.string().optional(),
});

type PurchaseOrderFormValues = z.infer<typeof purchaseOrderSchema>;

export default function PurchasesPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(mockPurchaseOrders);
  const [isAddEditDialogOpen, setAddEditDialogOpen] = useState(false);
  const [isCancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [items, setItems] = useState<PurchaseOrderItem[]>([]);
  const router = useRouter();
  const { toast } = useToast();
  
  const form = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      supplier_id: '',
      note: '',
    },
  });
  
  useEffect(() => {
    if (!isAddEditDialogOpen) {
        setItems([]);
        form.reset();
        setSelectedPO(null);
    } else {
        if(selectedPO) {
            form.reset({
                supplier_id: selectedPO.supplier_id,
                expected_delivery_date: selectedPO.expected_delivery_date ? new Date(selectedPO.expected_delivery_date) : undefined,
                note: selectedPO.note || ''
            });
            const poItems = mockPurchaseOrderItems
                .filter(item => item.purchase_order_id === selectedPO.id)
                .map(item => ({
                    productId: item.product_id,
                    productName: mockProducts.find(p => p.id === item.product_id)?.name || 'Sản phẩm không xác định',
                    quantity: item.quantity,
                    unitPrice: item.unit_price,
                }));
            setItems(poItems);
        }
    }
  }, [isAddEditDialogOpen, selectedPO, form]);

  const handleAddNew = () => {
    setSelectedPO(null);
    setAddEditDialogOpen(true);
  };
  
  const handleEdit = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setAddEditDialogOpen(true);
  };

  const handleCancel = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setCancelDialogOpen(true);
  };

  const confirmCancel = () => {
    if (!selectedPO) return;
    const poInDb = mockPurchaseOrders.find(p => p.id === selectedPO.id);
    if (poInDb) {
      poInDb.status = 'cancelled';
      poInDb.updated_at = new Date().toISOString();
    }
    setPurchaseOrders([...mockPurchaseOrders]);
    toast({ title: 'Thành công', description: `Đơn nhập hàng ${selectedPO.order_code} đã được hủy.` });
    setCancelDialogOpen(false);
    setSelectedPO(null);
  };
  
  const onSubmit = (values: PurchaseOrderFormValues) => {
    if (items.length === 0) {
        toast({ variant: 'destructive', title: 'Lỗi', description: 'Đơn nhập hàng phải có ít nhất một sản phẩm.' });
        return;
    }

    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const now = new Date().toISOString();
    const currentUser = mockUsers[0];

    if(selectedPO) {
        const poIndex = mockPurchaseOrders.findIndex(p => p.id === selectedPO.id);
        if (poIndex !== -1) {
            mockPurchaseOrders[poIndex] = {
                ...mockPurchaseOrders[poIndex],
                supplier_id: values.supplier_id,
                expected_delivery_date: values.expected_delivery_date?.toISOString() || null,
                note: values.note || null,
                total_amount: totalAmount,
                updated_at: now,
            };
            
            // This is a more robust way to update an array of objects in memory without reassigning an imported binding
            const otherItems = mockPurchaseOrderItems.filter(item => item.purchase_order_id !== selectedPO.id);
            const newItemsForThisPO = items.map((item, index) => ({
                id: `poi-${selectedPO.id}-${index}`,
                purchase_order_id: selectedPO.id,
                product_id: item.productId,
                quantity: item.quantity,
                unit_price: item.unitPrice,
                total_price: item.quantity * item.unitPrice,
                received_quantity: 0,
            }));
            
            mockPurchaseOrderItems.length = 0; 
            mockPurchaseOrderItems.push(...otherItems, ...newItemsForThisPO);

            toast({ title: "Thành công", description: "Đơn nhập hàng đã được cập nhật." });
        }
    } else {
        const newPO: PurchaseOrder = {
            id: `po-${Date.now()}`,
            order_code: `PN${new Date().toISOString().slice(2, 10).replace(/-/g, '')}${Math.floor(100 + Math.random() * 900)}`,
            supplier_id: values.supplier_id,
            total_amount: totalAmount,
            status: 'pending',
            expected_delivery_date: values.expected_delivery_date?.toISOString() || null,
            received_date: null,
            note: values.note || null,
            created_by_user_id: currentUser.id,
            created_at: now,
            updated_at: now,
        };
        mockPurchaseOrders.unshift(newPO);
        items.forEach((item, index) => {
            mockPurchaseOrderItems.push({
                id: `poi-${newPO.id}-${index}`,
                purchase_order_id: newPO.id,
                product_id: item.productId,
                quantity: item.quantity,
                unit_price: item.unitPrice,
                total_price: item.quantity * item.unitPrice,
                received_quantity: 0
            });
        });
        toast({ title: "Thành công", description: "Đơn nhập hàng mới đã được tạo." });
    }
    
    setPurchaseOrders([...mockPurchaseOrders]);
    setAddEditDialogOpen(false);
  };

  const addItemToOrder = (item: PurchaseOrderItem) => {
    setItems(prev => [...prev, item]);
  };
  
  const removeItemFromOrder = (productId: string) => {
    setItems(prev => prev.filter(item => item.productId !== productId));
  };
  
  const getSupplierName = (supplierId: string) => mockSuppliers.find(s => s.id === supplierId)?.name || 'N/A';
  const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  const formatDate = (dateString: string | null) => dateString ? new Date(dateString).toLocaleDateString('vi-VN') : 'N/A';
  
  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'received': return 'default';
      case 'ordered': return 'outline';
      case 'pending': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const handlePrint = (po: PurchaseOrder) => {
    const supplier = mockSuppliers.find(s => s.id === po.supplier_id);
    const createdBy = mockUsers.find(u => u.id === po.created_by_user_id);
    const poItems = mockPurchaseOrderItems.filter(item => item.purchase_order_id === po.id);
    const getProduct = (productId: string) => mockProducts.find(p => p.id === productId);

    if (!po || !supplier || !createdBy) {
        toast({ variant: 'destructive', title: 'Lỗi', description: 'Không đủ dữ liệu để in.' });
        return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể mở cửa sổ in. Vui lòng cho phép pop-up.',
      });
      return;
    }

    const itemsHtml = poItems.map((item, index) => {
        const product = getProduct(item.product_id);
        return `
            <tr class="item">
                <td class="text-center">${index + 1}</td>
                <td>${product?.name || 'Sản phẩm không tìm thấy'}</td>
                <td class="text-center">${product?.unit || 'cái'}</td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-right">${formatCurrency(item.unit_price)}</td>
                <td class="text-right">${formatCurrency(item.total_price)}</td>
                <td class="text-center"><div style="width: 16px; height: 16px; border: 1px solid #000; margin: auto;"></div></td>
            </tr>
        `;
    }).join('');

    const printHtml = `
      <html>
        <head>
          <title>Đơn Nhập Hàng ${po.order_code}</title>
          <style>
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
            body { font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #000; }
            .container { width: 90%; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { margin: 0; }
            .info-section { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .info-section div { width: 48%; }
            .info-section h3 { margin-top: 0; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            .info-section p { margin: 4px 0; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2 !important; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .total-section { text-align: right; margin-bottom: 40px; }
            .total-section h2 { margin: 5px 0; }
            .signature-section { display: flex; justify-content: space-around; text-align: center; margin-top: 50px; }
            .signature-section div { width: 30%; }
            .signature-section p { margin-top: 50px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>ĐƠN NHẬP HÀNG</h1>
              <p>Mã đơn: ${po.order_code}</p>
              <p>Ngày tạo: ${formatDate(po.created_at)}</p>
            </div>
            
            <div class="info-section">
                <div>
                    <h3>Thông tin cửa hàng</h3>
                    <p><strong>Tên:</strong> ${mockStores[0].name}</p>
                    <p><strong>Địa chỉ:</strong> ${mockStores[0].address}</p>
                    <p><strong>Điện thoại:</strong> ${mockStores[0].phone}</p>
                    <p><strong>Người tạo:</strong> ${createdBy.full_name}</p>
                </div>
                 <div>
                    <h3>Thông tin nhà cung cấp</h3>
                    <p><strong>Tên:</strong> ${supplier.name}</p>
                    <p><strong>Địa chỉ:</strong> ${supplier.address || 'N/A'}</p>
                    <p><strong>Điện thoại:</strong> ${supplier.phone}</p>
                    <p><strong>Người liên hệ:</strong> ${supplier.contact_person || 'N/A'}</p>
                </div>
            </div>

            <h3>Danh sách sản phẩm</h3>
            <table>
              <thead>
                <tr>
                  <th class="text-center">STT</th>
                  <th>Tên sản phẩm</th>
                  <th class="text-center">ĐVT</th>
                  <th class="text-center">Số lượng</th>
                  <th class="text-right">Đơn giá</th>
                  <th class="text-right">Thành tiền</th>
                  <th class="text-center" style="width: 10%;">Đã nhận</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div class="total-section">
                <h2>Tổng cộng: ${formatCurrency(po.total_amount)}</h2>
            </div>
            
            <div class="signature-section">
                <div>
                    <h4>Người lập phiếu</h4>
                    <p>(Ký, họ tên)</p>
                </div>
                 <div>
                    <h4>Thủ kho</h4>
                    <p>(Ký, họ tên)</p>
                </div>
                 <div>
                    <h4>Nhà cung cấp</h4>
                    <p>(Ký, họ tên)</p>
                </div>
            </div>

          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printHtml);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };


  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-headline">Nhập hàng</CardTitle>
              <CardDescription>
                Quản lý các đơn hàng nhập từ nhà cung cấp.
              </CardDescription>
            </div>
            <Button size="sm" className="h-10 gap-1 bg-accent hover:bg-accent/90" onClick={handleAddNew}>
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Thêm đơn nhập hàng
              </span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã ĐN</TableHead>
                <TableHead>Nhà cung cấp</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Tổng tiền</TableHead>
                <TableHead>
                  <span className="sr-only">Hành động</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseOrders.map((po) => (
                <TableRow key={po.id} onClick={() => router.push(`/purchases/${po.id}`)} className="cursor-pointer">
                  <TableCell className="font-medium">{po.order_code}</TableCell>
                  <TableCell>{getSupplierName(po.supplier_id)}</TableCell>
                  <TableCell>{formatDate(po.created_at)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(po.status)}>{po.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(po.total_amount)}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => handlePrint(po)}>
                          <Printer className="mr-2 h-4 w-4" /> In đơn nhập hàng
                        </DropdownMenuItem>
                        {po.status === 'pending' && <DropdownMenuItem onSelect={() => handleEdit(po)}>Sửa</DropdownMenuItem>}
                        {po.status !== 'received' && po.status !== 'cancelled' && <DropdownMenuItem onSelect={() => handleCancel(po)} className="text-destructive">Hủy</DropdownMenuItem>}
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
                Hiển thị <strong>{purchaseOrders.length}</strong> đơn nhập hàng
            </div>
        </CardFooter>
      </Card>
      
      <Dialog open={isAddEditDialogOpen} onOpenChange={setAddEditDialogOpen}>
        <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
                <DialogTitle className="font-headline">{selectedPO ? 'Sửa đơn nhập hàng' : 'Tạo đơn nhập hàng mới'}</DialogTitle>
                <DialogDescription>
                    Chọn nhà cung cấp và thêm sản phẩm vào đơn hàng.
                </DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="supplier_id"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Nhà cung cấp</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Chọn nhà cung cấp" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {mockSuppliers.filter(s => !s.is_deleted).map(supplier => (
                                        <SelectItem key={supplier.id} value={supplier.id}>{supplier.name}</SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="expected_delivery_date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col pt-2">
                                <FormLabel>Ngày dự kiến nhận</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                        {field.value ? format(field.value, "dd/MM/yyyy") : <span>Chọn ngày</span>}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        initialFocus
                                    />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name="note"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ghi chú</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Ghi chú thêm cho đơn hàng..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Separator />
                    <AddProductForm onAddItem={addItemToOrder} currentItems={items} />
                    <Separator />

                    <div>
                        <h3 className="text-lg font-medium mb-2">Sản phẩm trong đơn</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Sản phẩm</TableHead>
                                    <TableHead className="w-[100px] text-center">Số lượng</TableHead>
                                    <TableHead className="w-[150px] text-right">Đơn giá</TableHead>
                                    <TableHead className="w-[150px] text-right">Thành tiền</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.length === 0 ? (
                                    <TableRow><TableCell colSpan={5} className="text-center h-24">Chưa có sản phẩm nào.</TableCell></TableRow>
                                ) : (
                                    items.map(item => (
                                        <TableRow key={item.productId}>
                                            <TableCell className="font-medium">{item.productName}</TableCell>
                                            <TableCell className="text-center">{item.quantity}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.quantity * item.unitPrice)}</TableCell>
                                            <TableCell>
                                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeItemFromOrder(item.productId)}>
                                                    <Trash2 className="h-4 w-4 text-destructive"/>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                        <div className="flex justify-end mt-4 pr-4">
                            <div className="text-lg font-bold">
                                Tổng cộng: {formatCurrency(items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0))}
                            </div>
                        </div>
                    </div>
                    
                    <DialogFooter>
                        <Button type="submit" className="bg-primary hover:bg-primary/90">{selectedPO ? 'Lưu thay đổi' : 'Tạo đơn hàng'}</Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn hủy?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ hủy đơn nhập hàng <strong>{selectedPO?.order_code}</strong>. Thao tác này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Không</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel} className="bg-destructive hover:bg-destructive/90">Xác nhận hủy</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}


function AddProductForm({ onAddItem, currentItems }: { onAddItem: (item: PurchaseOrderItem) => void, currentItems: PurchaseOrderItem[] }) {
    const [selectedProductId, setSelectedProductId] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [unitPrice, setUnitPrice] = useState('0');
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const { toast } = useToast();

    const availableProducts = useMemo(() => {
        return mockProducts.filter(p => p.is_active && !p.is_deleted && !currentItems.some(item => item.productId === p.id));
    }, [currentItems]);

    const filteredProducts = useMemo(() => {
        if (!search) return availableProducts;
        return availableProducts.filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.product_code.toLowerCase().includes(search.toLowerCase())
        );
    }, [search, availableProducts]);

    useEffect(() => {
        const product = mockProducts.find(p => p.id === selectedProductId);
        if (product) {
            setUnitPrice(String(product.import_price));
        } else {
            setUnitPrice('0');
        }
    }, [selectedProductId]);

    const handleAdd = () => {
        const numQuantity = parseInt(quantity, 10);
        const numUnitPrice = parseFloat(unitPrice);

        if (!selectedProductId || isNaN(numQuantity) || numQuantity <= 0 || isNaN(numUnitPrice) || numUnitPrice < 0) {
            toast({ variant: 'destructive', title: 'Lỗi', description: 'Vui lòng điền đầy đủ và chính xác thông tin sản phẩm.' });
            return;
        }
        const product = mockProducts.find(p => p.id === selectedProductId);
        if (product) {
            onAddItem({
                productId: product.id,
                productName: product.name,
                quantity: numQuantity,
                unitPrice: numUnitPrice,
            });
            // Reset form
            setSelectedProductId('');
            setSearch('');
            setQuantity('1');
            setUnitPrice('0');
        }
    };

    const selectedProduct = availableProducts.find(p => p.id === selectedProductId);

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-4 border rounded-lg bg-muted/40">
            <div className="md:col-span-5">
                <Label>Sản phẩm</Label>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between font-normal"
                        >
                            {selectedProduct
                                ? selectedProduct.name
                                : "Chọn hoặc tìm sản phẩm..."}
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
                                        setSelectedProductId(product.id);
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
            </div>
            <div className="md:col-span-2">
                <Label>Số lượng</Label>
                <Input 
                    type="text" 
                    value={quantity} 
                    onChange={e => setQuantity(e.target.value)}
                    onBlur={e => {
                        const num = parseInt(e.target.value, 10);
                        if (isNaN(num) || num <= 0) {
                            setQuantity('1');
                        } else {
                            setQuantity(String(num));
                        }
                    }}
                    onFocus={e => e.target.select()} 
                />
            </div>
            <div className="md:col-span-3">
                <Label>Giá nhập</Label>
                <Input 
                    type="text" 
                    value={unitPrice} 
                    onChange={e => setUnitPrice(e.target.value)}
                    onBlur={e => {
                        const num = parseFloat(e.target.value);
                        if (isNaN(num) || num < 0) {
                            setUnitPrice('0');
                        } else {
                            setUnitPrice(String(num));
                        }
                    }}
                    onFocus={e => e.target.select()} 
                />
            </div>
            <Button type="button" onClick={handleAdd} className="md:col-span-2">Thêm vào đơn</Button>
        </div>
    )
}
