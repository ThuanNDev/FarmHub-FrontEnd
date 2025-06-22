import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function UsersPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Nhân viên</CardTitle>
        <CardDescription>
          Quản lý nhân viên và quyền hạn của họ.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Chức năng quản lý nhân viên và phân quyền sẽ được triển khai tại đây.</p>
        </div>
      </CardContent>
    </Card>
  );
}
