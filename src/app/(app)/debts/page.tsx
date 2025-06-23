
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar as CalendarIcon, MoreHorizontal, Printer, Search } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { addDays, format } from 'date-fns';
import { vi } from 'date-fns/locale';

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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { mockCustomers } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { RecordPaymentDialog, type PaymentFormValues } from '@/components/RecordPaymentDialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { useStore } from '@/contexts/StoreContext';

type Debtor = (typeof mockCustomers)[0];
type DebtStatus = { textKey: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' };

export default function DebtsPage() {
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { store } = useStore();

  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const [isPaymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedDebtor, setSelectedDebtor] = useState<Debtor | null>(null);
  const [debtStatuses, setDebtStatuses] = useState<Record<string, DebtStatus>>({});

  useEffect(() => {
    const customersWithDebt = mockCustomers.filter(
      (customer) => !customer.isDeleted && customer.totalDebt > 0
    );
    setDebtors(customersWithDebt);
  }, []);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newStatuses: Record<string, DebtStatus> = {};
    debtors.forEach(debtor => {
        if (!debtor.debtDueDate) {
            newStatuses[debtor.customerId] = { textKey: 'status.unknown', variant: 'outline' };
            return;
        }
        const dueDate = new Date(debtor.debtDueDate);
        
        if (dueDate < today) {
            newStatuses[debtor.customerId] = { textKey: 'status.overdue', variant: 'destructive' };
            return;
        }
        
        const diffTime = Math.abs(dueDate.getTime() - today.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 7) {
            newStatuses[debtor.customerId] = { textKey: 'status.due_soon', variant: 'default' };
        } else {
            newStatuses[debtor.customerId] = { textKey: 'status.within_due_date', variant: 'secondary' };
        }
    });
    setDebtStatuses(newStatuses);
  }, [debtors]);

  const filteredDebtors = useMemo(() => {
    let results = debtors;

    if (date?.from && date?.to) {
        const from = new Date(date.from);
        from.setHours(0, 0, 0, 0);
        const to = new Date(date.to);
        to.setHours(23, 59, 59, 999);

        results = results.filter(debtor => {
            if (!debtor.debtDueDate) return false;
            const dueDate = new Date(debtor.debtDueDate);
            return dueDate >= from && dueDate <= to;
        });
    }

    if (searchTerm) {
        results = results.filter(debtor =>
            debtor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            debtor.phone.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    return results;
  }, [searchTerm, debtors, date]);

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDateOnly = (dateString: string | null) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'dd/MM/yyyy');
  };

  const handleOpenPaymentDialog = (debtor: Debtor) => {
    setSelectedDebtor(debtor);
    setPaymentDialogOpen(true);
  };

  const handleConfirmPayment = (values: PaymentFormValues) => {
    if (!selectedDebtor) return;

    const customerInDb = mockCustomers.find(c => c.customerId === selectedDebtor.customerId);
    if(customerInDb) {
      const newDebt = customerInDb.totalDebt - values.amount;
      customerInDb.totalDebt = newDebt < 0 ? 0 : newDebt;
    }

    setDebtors(mockCustomers.filter(c => !c.isDeleted && c.totalDebt > 0));

    toast({
      title: 'Thành công',
      description: `Ghi nhận thanh toán ${formatCurrency(values.amount)} cho khách hàng ${selectedDebtor.name}.`,
    });

    setPaymentDialogOpen(false);
    setSelectedDebtor(null);
  };

  const handlePrint = () => {
    if (filteredDebtors.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Không có dữ liệu',
        description: 'Không có công nợ nào trong khoảng thời gian đã chọn để in.',
      });
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

    const totalDebt = filteredDebtors.reduce((sum, debtor) => sum + debtor.totalDebt, 0);

    const itemsHtml = filteredDebtors.map((debtor, index) => `
      <tr>
        <td style="text-align: center;">${index + 1}</td>
        <td>${debtor.name}</td>
        <td>${debtor.phone}</td>
        <td style="text-align: right;">${formatCurrency(debtor.totalDebt)}</td>
        <td style="text-align: center;">${formatDateOnly(debtor.debtDueDate)}</td>
      </tr>
    `).join('');

    const printHtml = `
      <html>
        <head>
          <title>Báo cáo công nợ</title>
          <style>
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
            body { font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #000; }
            .container { width: 95%; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 24px; }
            .store-info { text-align: left; margin-bottom: 20px; }
            .report-info { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2 !important; }
            .total-section { text-align: right; margin-top: 20px; font-size: 16px; font-weight: bold; }
            .footer { display: flex; justify-content: space-around; text-align: center; margin-top: 50px; }
            .footer div { width: 30%; }
            .footer p { margin-top: 60px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="store-info">
                <h3>${store.name}</h3>
                <p>Địa chỉ: ${store.address}</p>
                <p>SĐT: ${store.phone}</p>
            </div>
            <div class="header">
              <h1>BÁO CÁO CÔNG NỢ PHẢI THU</h1>
            </div>
            <div class="report-info">
              <p>Từ ngày: ${date?.from ? format(date.from, 'dd/MM/yyyy') : '...'} - Đến ngày: ${date?.to ? format(date.to, 'dd/MM/yyyy') : '...'}</p>
            </div>

            <table>
              <thead>
                <tr>
                  <th style="text-align: center;">STT</th>
                  <th>Khách hàng</th>
                  <th>Số điện thoại</th>
                  <th style="text-align: right;">Số tiền nợ</th>
                  <th style="text-align: center;">Ngày đến hạn</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div class="total-section">
                <span>Tổng cộng: ${formatCurrency(totalDebt)}</span>
            </div>
            
            <div class="footer">
                <div>
                    <h4>Người lập báo cáo</h4>
                    <p>(Ký, họ tên)</p>
                </div>
                 <div>
                    <h4>Kế toán</h4>
                    <p>(Ký, họ tên)</p>
                </div>
                 <div>
                    <h4>Giám đốc</h4>
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
              <CardTitle className="font-headline">Quản lý công nợ</CardTitle>
              <CardDescription>
                Theo dõi và quản lý các khoản công nợ của khách hàng.
              </CardDescription>
            </div>
             <div className="flex items-center gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                                "w-[260px] justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date?.from ? (
                                date.to ? (
                                    <>
                                        {format(date.from, "dd/MM/yyyy")} - {format(date.to, "dd/MM/yyyy")}
                                    </>
                                ) : (
                                    format(date.from, "dd/MM/yyyy")
                                )
                            ) : (
                                <span>Chọn ngày đến hạn</span>
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
                            locale={vi}
                        />
                    </PopoverContent>
                </Popover>

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
                <Button size="sm" variant="outline" className="h-10 gap-1" onClick={handlePrint}>
                    <Printer className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">In danh sách</span>
                </Button>
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
                  const status = debtStatuses[debtor.customerId] || { textKey: 'status.unknown', variant: 'outline' };
                  return (
                    <TableRow key={debtor.customerId}>
                      <TableCell className="font-medium">{debtor.name}</TableCell>
                      <TableCell>{debtor.phone}</TableCell>
                      <TableCell className="text-right">{formatCurrency(debtor.totalDebt)}</TableCell>
                      <TableCell className="hidden sm:table-cell">{formatDateOnly(debtor.debtDueDate)}</TableCell>
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
                            <DropdownMenuItem onClick={() => router.push(`/customers/${debtor.customerId}`)}>Xem chi tiết</DropdownMenuItem>
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
          description={`Tổng nợ hiện tại là ${formatCurrency(selectedDebtor.totalDebt)}. Nhập số tiền đã thanh toán.`}
          dueAmount={selectedDebtor.totalDebt}
          onConfirm={handleConfirmPayment}
        />
      )}
    </>
  );
}
