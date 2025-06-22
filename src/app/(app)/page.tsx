'use client';
import {
  DollarSign,
  Users,
  CreditCard,
  ArrowUpRight,
  ShoppingCart,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
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
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { mockOrders, mockCustomers, mockProducts, mockOrderItems, mockChartData } from '@/lib/data';
import { useMemo, useState, useEffect } from 'react';

export default function Dashboard() {
  const [newOrdersThisMonth, setNewOrdersThisMonth] = useState(0);

  useEffect(() => {
    const today = new Date();
    const newOrdersCount = mockOrders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate.getMonth() === today.getMonth() && orderDate.getFullYear() === today.getFullYear() && order.status !== 'Cancelled';
    }).length;
    setNewOrdersThisMonth(newOrdersCount);
  }, []);


  const formatCurrency = (amount: number) => {
    if (isNaN(amount)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  }

  const {
    totalRevenue,
    totalDebt,
    totalCustomers,
    recentOrders,
    bestSellingProducts
  } = useMemo(() => {
    const totalRevenue = mockOrders.reduce((sum, order) => order.status !== 'Cancelled' ? sum + order.total_amount : sum, 0);
    const totalDebt = mockCustomers.reduce((sum, customer) => sum + (customer.total_debt || 0), 0);
    const totalCustomers = mockCustomers.filter(c => !c.is_deleted).length;
    
    const recentOrders = [...mockOrders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);

    const productSales: { [key: string]: { quantity: number, product: any } } = {};

    mockOrderItems.forEach(item => {
        const order = mockOrders.find(o => o.id === item.order_id);
        if (order && order.status !== 'Cancelled') {
            if (!productSales[item.product_id]) {
                const product = mockProducts.find(p => p.id === item.product_id);
                if (product) {
                    productSales[item.product_id] = { product, quantity: 0 };
                }
            }
            if (productSales[item.product_id]) {
                productSales[item.product_id].quantity += item.quantity;
            }
        }
    });

    const bestSellingProducts = Object.values(productSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
        
    return { totalRevenue, totalDebt, totalCustomers, recentOrders, bestSellingProducts };
  }, []);

  const getCustomerName = (customerId: string) => {
    return mockCustomers.find(c => c.id === customerId)?.name || 'Khách lẻ';
  };
  
  const getImageUrl = (imagesJson: string) => {
    try {
      const images = JSON.parse(imagesJson);
      return images[0] || 'https://picsum.photos/40/40';
    } catch (e) {
      return 'https://picsum.photos/40/40';
    }
  };


  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-8">
      {/* 4 Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        {/* Total Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">+20.1% so với tháng trước</p>
          </CardContent>
        </Card>
        {/* Total Debt */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng công nợ</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalDebt)}</div>
            <p className="text-xs text-muted-foreground">Tổng nợ từ các khách hàng</p>
          </CardContent>
        </Card>
        {/* Total Customers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Khách hàng</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Tổng số khách hàng</p>
          </CardContent>
        </Card>
        {/* New Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đơn hàng mới</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{newOrdersThisMonth}</div>
            <p className="text-xs text-muted-foreground">Trong tháng này</p>
          </CardContent>
        </Card>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
        {/* Revenue Chart */}
        <Card className="md:col-span-3">
            <CardHeader>
                <CardTitle className="font-headline">Tổng quan doanh thu</CardTitle>
                <CardDescription>Doanh thu 12 tháng gần nhất</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <ChartContainer config={{ revenue: { label: "Doanh thu", color: "hsl(var(--primary))" } }} className="h-[300px] w-full">
                    <BarChart data={mockChartData} accessibilityLayer>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            fontSize={12}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            fontSize={12}
                            tickFormatter={(value) => `${(value as number) / 1000000}tr`}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent
                                formatter={(value) => formatCurrency(value as number)}
                                indicator="dot"
                            />}
                        />
                        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
                <CardTitle className="font-headline">Đơn hàng gần đây</CardTitle>
                <CardDescription>
                    Bạn có {mockOrders.filter(o => o.status === 'Pending').length} đơn hàng đang chờ xử lý.
                </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1 bg-accent hover:bg-accent/90">
                <Link href="/orders">
                    Xem tất cả
                    <ArrowUpRight className="h-4 w-4" />
                </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead className="hidden sm:table-cell">Ngày</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Tổng tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="font-medium">{getCustomerName(order.customer_id)}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {new Date(order.created_at).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell>
                        <Badge variant={order.status === 'Delivered' ? 'default' : order.status === 'Cancelled' ? 'destructive' : 'secondary'}>
                            {order.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(order.total_amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Best Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Sản phẩm bán chạy</CardTitle>
            <CardDescription>Top 5 sản phẩm bán chạy nhất.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bestSellingProducts.length > 0 ? bestSellingProducts.map(({product, quantity}) => (
                <div key={product.id} className="flex items-center">
                    <Avatar className="h-9 w-9 border">
                        <AvatarImage src={getImageUrl(product.images)} alt={product.name} data-ai-hint={product.hint} />
                        <AvatarFallback>{product.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.brand}</p>
                    </div>
                    <div className="ml-auto font-medium">+{quantity}</div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">Chưa có dữ liệu bán hàng.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
