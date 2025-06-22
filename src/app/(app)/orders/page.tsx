
'use client';

import { useState, useMemo } from 'react';
import { File, MoreHorizontal, RefreshCw, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
import { Input } from '@/components/ui/input';
import { mockOrders, mockCustomers, mockOrderItems } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

type Order = typeof mockOrders[0];

export default function OrdersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);

  const getCustomerName = (customerId: string) => {
    return mockCustomers.find(c => c.id === customerId)?.name || t('pos.guest');
  };

  const filteredOrders = useMemo(() => {
    const sortedOrders = [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    let ordersToFilter = sortedOrders;
    if (activeTab !== 'all') {
        ordersToFilter = sortedOrders.filter(o => o.status.toLowerCase() === activeTab.toLowerCase());
    }
    
    if (searchTerm) {
        ordersToFilter = ordersToFilter.filter(order => 
            order.order_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            getCustomerName(order.customer_id).toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    return ordersToFilter;
  }, [orders, activeTab, searchTerm, t]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'default';
      case 'Pending':
        return 'secondary';
      case 'Cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  }

  const handlePrint = (order: Order) => {
    toast({ title: t('pages.order_details.wip_title'), description: t('pages.orders.action_print') + ' ' + t('pages.order_details.wip_description') });
  };

  const handleEdit = (order: Order) => {
    if (order.status !== 'Pending') {
        toast({ variant: 'destructive', title: t('pages.order_details.cannot_edit_title'), description: t('pages.orders.action_cannot_edit')});
        return;
    }
    toast({ title: t('pages.order_details.wip_title'), description: 'Chức năng sửa đơn hàng sẽ sớm được ra mắt.' });
  };

  const handleOpenCancelDialog = (order: Order) => {
    if (order.status === 'Delivered' || order.status === 'Cancelled') {
      toast({ variant: 'destructive', title: 'Không thể hủy', description: t('pages.orders.action_cannot_cancel') });
      return;
    }
    setOrderToCancel(order);
  };
  
  const handleConfirmCancel = () => {
    if (!orderToCancel) return;
    setOrders(prevOrders =>
      prevOrders.map(o =>
        o.id === orderToCancel.id ? { ...o, status: 'Cancelled', delivery_status: 'Cancelled', updated_at: new Date().toISOString() } : o
      )
    );
    toast({ title: t('common.success'), description: t('pages.orders.success_cancel', { code: orderToCancel.order_code }) });
    setOrderToCancel(null);
  };

  const handleRecreateOrder = (cancelledOrder: Order) => {
    const now = new Date();
    const newOrderCode = `DH${now.toISOString().slice(2, 10).replace(/-/g, '')}${Math.floor(100 + Math.random() * 900)}`;

    const newOrder: Order = {
      ...cancelledOrder,
      id: `ord-${now.getTime()}`,
      order_code: newOrderCode,
      status: 'Pending',
      delivery_status: 'Processing',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    const originalItems = mockOrderItems.filter(item => item.order_id === cancelledOrder.id);
    const newItems = originalItems.map(item => ({
      ...item,
      id: `item-${now.getTime()}-${Math.floor(Math.random() * 1000)}`,
      order_id: newOrder.id,
    }));
    
    mockOrderItems.push(...newItems);
    mockOrders.unshift(newOrder);

    setOrders(prevOrders => [newOrder, ...prevOrders]);

    toast({
      title: t('common.success'),
      description: t('pages.orders.success_recreate', { code: newOrder.order_code }),
    });
  };

  const handleExport = () => {
    if (filteredOrders.length === 0) {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: t('pages.orders.error_no_export_data'),
      });
      return;
    }

    const headers = [
      t('pages.orders.table_code'),
      t('pages.orders.table_customer'),
      t('pages.orders.table_date'),
      t('pages.orders.table_status'),
      t('pages.orders.table_total'),
      t('pages.order_details.paid'),
      t('pages.order_details.remaining'),
      t('pages.order_details.payment_method')
    ];
    
    const rows = filteredOrders.map(order => [
      `"${order.order_code}"`,
      `"${getCustomerName(order.customer_id)}"`,
      `"${formatDate(order.created_at)}"`,
      `"${t(`status.${order.status.toLowerCase()}`)}"`,
      order.total_amount,
      order.total_paid,
      order.total_amount - order.total_paid,
      `"${order.payment_type}"`
    ]);

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");
        
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const fileName = `don_hang_${new Date().toISOString().slice(0,10)}.csv`;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
    
    toast({
        title: t('common.success'),
        description: t('pages.orders.success_export', { count: filteredOrders.length, fileName }),
    });
  };


  return (
    <>
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">{t('pages.orders.tab_all')}</TabsTrigger>
            <TabsTrigger value="pending">{t('pages.orders.tab_pending')}</TabsTrigger>
            <TabsTrigger value="delivered">{t('pages.orders.tab_delivered')}</TabsTrigger>
            <TabsTrigger value="cancelled">
              {t('pages.orders.tab_cancelled')}
            </TabsTrigger>
          </TabsList>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder={t('pages.orders.search_placeholder')}
                    className="pl-8 sm:w-[200px] md:w-[300px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Button size="sm" variant="outline" className="h-10 gap-1" onClick={handleExport}>
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                {t('common.export_file')}
              </span>
            </Button>
          </div>
        </div>
        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">{t('pages.orders.title')}</CardTitle>
              <CardDescription>
                {t('pages.orders.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('pages.orders.table_code')}</TableHead>
                    <TableHead>{t('pages.orders.table_customer')}</TableHead>
                    <TableHead className="hidden md:table-cell">{t('pages.orders.table_date')}</TableHead>
                    <TableHead>{t('pages.orders.table_status')}</TableHead>
                    <TableHead className="text-right">{t('pages.orders.table_total')}</TableHead>
                    <TableHead>
                      <span className="sr-only">{t('common.actions')}</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} onClick={() => router.push(`/orders/${order.id}`)} className="cursor-pointer">
                      <TableCell className="font-medium">{order.order_code}</TableCell>
                      <TableCell>{getCustomerName(order.customer_id)}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatDate(order.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(order.status) as any}>
                          {t(`status.${order.status.toLowerCase()}`)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(order.total_amount)}
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
                            {order.status === 'Cancelled' ? (
                                <DropdownMenuItem onSelect={() => handleRecreateOrder(order)}>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    <span>{t('pages.orders.action_recreate')}</span>
                                </DropdownMenuItem>
                            ) : (
                                <>
                                    <DropdownMenuItem onSelect={() => handlePrint(order)}>{t('pages.orders.action_print')}</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => handleEdit(order)} disabled={order.status !== 'Pending'}>{t('common.edit')}</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                        onSelect={() => handleOpenCancelDialog(order)} 
                                        className="text-destructive" 
                                        disabled={order.status === 'Delivered' || order.status === 'Cancelled'}
                                    >
                                        {t('pages.orders.action_cancel')}
                                    </DropdownMenuItem>
                                </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

       <AlertDialog open={!!orderToCancel} onOpenChange={(open) => !open && setOrderToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.are_you_sure')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('pages.orders.cancel_dialog_description', { code: orderToCancel?.order_code })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOrderToCancel(null)}>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel} className="bg-destructive hover:bg-destructive/90">{t('common.confirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
