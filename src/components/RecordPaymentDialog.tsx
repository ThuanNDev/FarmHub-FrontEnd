'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useEffect } from 'react';

const paymentSchema = z.object({
  amount: z.coerce.number().positive({ message: "Số tiền phải lớn hơn 0." }),
  paymentMethod: z.enum(['Cash', 'Card', 'Transfer'], { required_error: "Vui lòng chọn phương thức thanh toán." }),
  note: z.string().optional(),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  dueAmount: number;
  onConfirm: (values: PaymentFormValues) => void;
}

export function RecordPaymentDialog({
  open,
  onOpenChange,
  title,
  description,
  dueAmount,
  onConfirm,
}: RecordPaymentDialogProps) {
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: dueAmount > 0 ? dueAmount : 0,
      paymentMethod: 'Cash',
      note: '',
    },
  });
  
  useEffect(() => {
    if (open) {
      form.reset({
        amount: dueAmount > 0 ? dueAmount : 0,
        paymentMethod: 'Cash',
        note: '',
      });
    }
  }, [open, dueAmount, form]);

  const onSubmit = (values: PaymentFormValues) => {
    onConfirm(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-headline">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số tiền thanh toán</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} className="text-lg font-bold" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phương thức thanh toán</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn phương thức" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Cash">Tiền mặt</SelectItem>
                      <SelectItem value="Card">Thẻ</SelectItem>
                      <SelectItem value="Transfer">Chuyển khoản</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ghi chú thêm (nếu có)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90">Xác nhận thanh toán</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
