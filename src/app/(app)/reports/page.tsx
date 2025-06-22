'use client';

import * as React from 'react';
import { addDays, format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';
import { Calendar as CalendarIcon, BarChart2, Users, Package, FileDown } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Card,
  CardContent,
  CardDescription,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { mockOrders, mockCustomers, mockProducts, mockOrderItems } from '@/lib/data';
import { useRouter } from 'next/navigation';

export default function ReportsPage() {
  const [date, setDate] = React.useState<DateRange | undefined>(undefined);
  const router = useRouter();
  
  React.useEffect(() => {
    setDate({
      from: addDays(new Date(), -29),
      to: new Date(),
    });
  }, []);

  const formatCurrency = (amount: number) => {
    if (isNaN(amount)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };
  
  const formatDate = (date: Date) => {
    return format(date, "dd/MM/yyyy");
  }

  const {
    filteredOrders,
    revenueChartData,
    topCustomers,
    topProducts,
    totalRevenue,
  } = React.useMemo(() => {
    if (!date?.from || !date?.to) {
        return { filteredOrders: [], revenueChartData: [], topCustomers: [], topProducts: [], totalRevenue: 0 };
    }

    const filtered = mockOrders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= date.from! && orderDate <= date.to! && order.status !== 'Cancelled';
    });

    const revenue = filtered.reduce((acc, order) => acc + order.total_amount, 0);

    const dailyRevenue: { [key: string]: number } = {};
    for (const order of filtered) {
        const day = format(new Date(order.created_at), 'dd/MM');
        if (!dailyRevenue[day]) {
            dailyRevenue[day] = 0;
        }
        dailyRevenue[day] += order.total_amount;
    }
    const chartData = Object.keys(dailyRevenue).map(day => ({
        name: day,
        DoanhThu: dailyRevenue[day],
    })).sort((a, b) => {
        const [dayA, monthA] = a.name.split('/');
        const [dayB, monthB] = b.name.split('/');
        const dateA = new Date(new Date().getFullYear(), parseInt(monthA) - 1, parseInt(dayA));
        const dateB = new Date(new Date().getFullYear(), parseInt(monthB) - 1, parseInt(dayB));
        return dateA.getTime() - dateB.getTime();
    });


    const customerSpending: { [id: string]: { id: string, name: string, phone: string, total: number } } = {};
    for (const order of filtered) {
        const customer = mockCustomers.find(c => c.id === order.customer_id);
        const customerName = customer?.name || 'Khách lẻ';
        const customerPhone = customer?.phone || '-';
        const id = customer?.id || 'guest';

        if (!customerSpending[id]) {
            customerSpending[id] = { id, name: customerName, phone: customerPhone, total: 0 };
        }
        customerSpending[id].total += order.total_amount;
    }
    const sortedCustomers = Object.values(customerSpending).sort((a, b) => b.total - a.total).slice(0, 5);

    const filteredOrderIds = new Set(filtered.map(o => o.id));
    const relevantOrderItems = mockOrderItems.filter(item => filteredOrderIds.has(item.order_id));
    
    const productSales: { [id: string]: { product: any, quantity: number } } = {};
    for (const item of relevantOrderItems) {
        const product = mockProducts.find(p => p.id === item.product_id);
        if (product) {
            if (!productSales[product.id]) {
                productSales[product.id] = { product, quantity: 0 };
            }
            productSales[product.id].quantity += item.quantity;
        }
    }
    
    const getImageUrl = (imagesJson: string) => {
        try {
          const images = JSON.parse(imagesJson);
          return images[0] || 'https://placehold.co/40x40.png';
        } catch (e) {
          return 'https://placehold.co/40x40.png';
        }
    };
    
    const sortedProducts = Object.values(productSales).map(p => ({
        ...p.product,
        quantity: p.quantity,
        image: getImageUrl(p.product.images)
    })).sort((a, b) => b.quantity - a.quantity).slice(0, 5);


    return {
        filteredOrders: filtered.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
        revenueChartData: chartData,
        topCustomers: sortedCustomers,
        topProducts: sortedProducts,
        totalRevenue: revenue,
    };

  }, [date]);
  
  const getCustomerName = (customerId: string) => {
    return mockCustomers.find(c => c.id === customerId)?.name || 'Khách lẻ';
  };
  
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


  return (
    <div className="flex flex-col gap-4">
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle className="font-headline">Báo cáo tổng quan</CardTitle>
                        <CardDescription>Xem báo cáo doanh thu và hiệu suất trong một khoảng thời gian.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                "w-full sm:w-[300px] justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date?.from ? (
                                date.to ? (
                                    <>
                                    {format(date.from, "dd/MM/y", { locale: vi })} -{" "}
                                    {format(date.to, "dd/MM/y", { locale: vi })}
                                    </>
                                ) : (
                                    format(date.from, "dd/MM/y", { locale: vi })
                                )
                                ) : (
                                <span>Chọn ngày</span>
                                )}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={2}
                            />
                            </PopoverContent>
                        </Popover>
                         <Button size="sm" variant="outline" className="h-10 gap-1">
                            <FileDown className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                Xuất file
                            </span>
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="grid gap-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="font-headline flex items-center gap-2">
                                    <BarChart2 className="h-5 w-5 text-primary"/>
                                    Biểu đồ doanh thu
                                </CardTitle>
                                <CardDescription>Tổng doanh thu trong khoảng thời gian đã chọn: <strong>{formatCurrency(totalRevenue)}</strong></CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={revenueChartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${(value as number) / 1000000}tr`} />
                                <Tooltip 
                                    formatter={(value) => formatCurrency(value as number)}
                                    cursor={{fill: 'hsl(var(--muted))'}}
                                />
                                <Bar dataKey="DoanhThu" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary"/>
                                Top 5 khách hàng
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                            {topCustomers.map((customer, index) => (
                                <div key={customer.id + index} className="flex items-center">
                                    <Avatar className="h-9 w-9 border">
                                        <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{customer.name}</p>
                                        <p className="text-sm text-muted-foreground">{customer.phone}</p>
                                    </div>
                                    <div className="ml-auto font-medium">{formatCurrency(customer.total)}</div>
                                </div>
                            ))}
                             {topCustomers.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Không có dữ liệu.</p>}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2">
                                <Package className="h-5 w-5 text-primary"/>
                                Top 5 sản phẩm bán chạy
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="space-y-4">
                            {topProducts.map((product) => (
                                <div key={product.id} className="flex items-center">
                                    <Avatar className="h-9 w-9 border">
                                        <AvatarImage src={product.image} alt={product.name} />
                                        <AvatarFallback>{product.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{product.name}</p>
                                        <p className="text-sm text-muted-foreground">{product.brand}</p>
                                    </div>
                                    <div className="ml-auto font-medium">Đã bán: {product.quantity}</div>
                                </div>
                            ))}
                            {topProducts.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Không có dữ liệu.</p>}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Chi tiết đơn hàng</CardTitle>
                        <CardDescription>Danh sách các đơn hàng trong khoảng thời gian đã chọn.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead>Mã ĐH</TableHead>
                                <TableHead>Khách hàng</TableHead>
                                <TableHead>Ngày</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right">Tổng tiền</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {filteredOrders.map((order) => (
                                <TableRow key={order.id} className="cursor-pointer" onClick={() => router.push(`/orders/${order.id}`)}>
                                <TableCell className="font-medium">{order.order_code}</TableCell>
                                <TableCell>{getCustomerName(order.customer_id)}</TableCell>
                                <TableCell>{formatDate(new Date(order.created_at))}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(order.status) as any}>
                                    {order.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">{formatCurrency(order.total_amount)}</TableCell>
                                </TableRow>
                            ))}
                            {filteredOrders.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        Không có đơn hàng nào trong khoảng thời gian này.
                                    </TableCell>
                                </TableRow>
                            )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
    </div>
  )
}
