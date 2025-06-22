import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Cài đặt</CardTitle>
        <CardDescription>
          Cấu hình hệ thống, đơn vị tiền tệ, in ấn và phân quyền.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Các tùy chọn cấu hình hệ thống sẽ có tại đây.</p>
        </div>
      </CardContent>
    </Card>
  );
}
