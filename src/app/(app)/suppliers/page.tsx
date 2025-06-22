import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function SuppliersPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Nhà cung cấp</CardTitle>
        <CardDescription>
          Quản lý các nhà cung cấp của bạn.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Chức năng quản lý nhà cung cấp sẽ được triển khai tại đây.</p>
        </div>
      </CardContent>
    </Card>
  );
}
