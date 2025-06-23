
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Search } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { mockCustomers } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { RecordPaymentDialog, type PaymentFormValues } from '@/components/RecordPaymentDialog';
import { useLanguage } from '@/contexts/LanguageContext';

type Debtor = (typeof mockCustomers)[0];
type DebtStatus = { textKey: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' };

export default function DebtsPage() {
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [isPaymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedDebtor, setSelectedDebtor] = useState<Debtor | null>(null);
  const [debtStatuses, setDebtStatuses] = useState<Record<string, DebtStatus>>({});

  useEffect(() => {
    const customersWithDebt = mockCustomers.filter(
      (customer) => !customer.is_deleted && customer.total_debt > 0
    );
    setDebtors(customersWithDebt);
  }, []);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newStatuses: Record<string, DebtStatus> = {};
    debtors.forEach(debtor => {
        if (!debtor.debt_due_date) {
            newStatuses[debtor.CustomerId] = { textKey: 'status.unknown', variant: 'outline' };
            return;
        }
        const dueDate = new Date(debtor.debt_due_date);
        
        if (dueDate < today) {
            newStatuses[debtor.CustomerId] = { textKey: 'status.overdue', variant: 'destructive' };
            return;
        }
        
        const diffTime = Math.abs(dueDate.getTime() - today.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 7) {
            newStatuses[debtor.CustomerId] = { textKey: 'status.due_soon', variant: 'default' };
        } else {
            newStatuses[debtor.CustomerId] = { textKey: 'status.within_due_date', variant: 'secondary' };
        }
    });
    setDebtStatuses(newStatuses);
  }, [debtors]);

  const filteredDebtors = useMemo(() => {
    if (!searchTerm) return debtors;
    return debtors.filter(debtor =>
      debtor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      debtor.phone.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, debtors]);

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const handleOpenPaymentDialog = (debtor: Debtor) => {
    setSelectedDebtor(debtor);
    setPaymentDialogOpen(true);
  };

  const handleConfirmPayment = (values: PaymentFormValues) => {
    if (!selectedDebtor) return;

    const customerInDb = mockCustomers.find(c => c.CustomerId === selectedDebtor.CustomerId);
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-headline">Quản lý công nợ</CardTitle>
              <CardDescription>
                Theo dõi và quản lý các khoản công nợ của khách hàng.
              </CardDescription>
            </div>
             <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Tìm theo tên, SĐT..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
          </div>
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
              {filteredDebtors.length > 0 ? (
                filteredDebtors.map((debtor) => {
                  const status = debtStatuses[debtor.CustomerId] || { textKey: 'status.unknown', variant: 'outline' };
                  return (
                    <TableRow key={debtor.CustomerId}>
                      <TableCell className="font-medium">{debtor.name}</TableCell>
                      <TableCell>{debtor.phone}</TableCell>
                      <TableCell className="text-right">{formatCurrency(debtor.total_debt)}</TableCell>
                      <TableCell className="hidden sm:table-cell">{formatDate(debtor.debt_due_date)}</TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{t(status.textKey)}</Badge>
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
                            <DropdownMenuItem onClick={() => router.push(`/customers/${debtor.CustomerId}`)}>Xem chi tiết</DropdownMenuItem>
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
            Hiển thị <strong>{filteredDebtors.length}</strong> trên <strong>{debtors.length}</strong> khách hàng có công nợ.
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
