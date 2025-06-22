import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function PurchasesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Nhập hàng</CardTitle>
        <CardDescription>
          Quản lý các đơn nhập hàng và cập nhật tồn kho.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Tính năng quản lý nhập hàng sẽ được triển khai tại đây.</p>
        </div>
      </CardContent>
    </Card>
  );
}
