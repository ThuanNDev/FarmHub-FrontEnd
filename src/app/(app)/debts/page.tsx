import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function DebtsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Công nợ</CardTitle>
        <CardDescription>
          Quản lý công nợ khách hàng và các khoản thanh toán chưa hoàn tất.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Chức năng quản lý công nợ sẽ được triển khai tại đây.</p>
        </div>
      </CardContent>
    </Card>
  );
}
