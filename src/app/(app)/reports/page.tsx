import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function ReportsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Báo cáo</CardTitle>
        <CardDescription>
          Xem báo cáo doanh thu, sản phẩm bán chạy và hiệu suất hàng tháng.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Các tính năng báo cáo sẽ được triển khai tại đây.</p>
        </div>
      </CardContent>
    </Card>
  );
}
