'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { mockCustomers } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { RecordPaymentDialog, type PaymentFormValues } from '@/components/RecordPaymentDialog';

type Debtor = (typeof mockCustomers)[0];

export default function DebtsPage() {
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  const [isPaymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedDebtor, setSelectedDebtor] = useState<Debtor | null>(null);

  useEffect(() => {
    const customersWithDebt = mockCustomers.filter(
      (customer) => !customer.is_deleted && customer.total_debt > 0
    );
    setDebtors(customersWithDebt);
  }, []);

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getDebtStatus = (debtor: Debtor) => {
    if (!debtor.debt_due_date) return { text: 'Không rõ', variant: 'outline' as const };
    const dueDate = new Date(debtor.debt_due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dueDate < today) {
      return { text: 'Quá hạn', variant: 'destructive' as const };
    }
    
    const diffTime = Math.abs(dueDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 7) {
      return { text: 'Sắp đến hạn', variant: 'default' as const };
    }

    return { text: 'Trong hạn', variant: 'secondary' as const };
  };

  const handleOpenPaymentDialog = (debtor: Debtor) => {
    setSelectedDebtor(debtor);
    setPaymentDialogOpen(true);
  };

  const handleConfirmPayment = (values: PaymentFormValues) => {
    if (!selectedDebtor) return;

    const customerInDb = mockCustomers.find(c => c.id === selectedDebtor.id);
    if(customerInDb) {
      const newDebt = customerInDb.total_debt - values.amount;
      customerInDb.total_debt = newDebt < 0 ? 0 : newDebt;
    }

    setDebtors(mockCustomers.filter(c => !c.is_deleted && c.total_debt > 0));

    toast({
      title: 'Thành công',
      description: `Ghi nhận thanh toán ${formatCurrency(values.amount)} cho khách hàng ${selectedDebtor.name}.`,
    });

    setPaymentDialogOpen(false);
    setSelectedDebtor(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Quản lý công nợ</CardTitle>
          <CardDescription>
            Theo dõi và quản lý các khoản công nợ của khách hàng.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Số điện thoại</TableHead>
                <TableHead className="text-right">Tổng nợ</TableHead>
                <TableHead className="hidden sm:table-cell">Ngày đến hạn</TableHead>
                <TableHead>Tình trạng</TableHead>
                <TableHead>
                  <span className="sr-only">Hành động</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {debtors.length > 0 ? (
                debtors.map((debtor) => {
                  const status = getDebtStatus(debtor);
                  return (
                    <TableRow key={debtor.id}>
                      <TableCell className="font-medium">{debtor.name}</TableCell>
                      <TableCell>{debtor.phone}</TableCell>
                      <TableCell className="text-right">{formatCurrency(debtor.total_debt)}</TableCell>
                      <TableCell className="hidden sm:table-cell">{formatDate(debtor.debt_due_date)}</TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.text}</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/customers/${debtor.id}`)}>Xem chi tiết</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenPaymentDialog(debtor)}>Ghi nhận thanh toán</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Không có công nợ nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Hiển thị <strong>{debtors.length}</strong> khách hàng có công nợ.
          </div>
        </CardFooter>
      </Card>
      
      {selectedDebtor && (
        <RecordPaymentDialog
          open={isPaymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          title={`Ghi nhận thanh toán cho ${selectedDebtor.name}`}
          description={`Tổng nợ hiện tại là ${formatCurrency(selectedDebtor.total_debt)}. Nhập số tiền đã thanh toán.`}
          dueAmount={selectedDebtor.total_debt}
          onConfirm={handleConfirmPayment}
        />
      )}
    </>
  );
}
