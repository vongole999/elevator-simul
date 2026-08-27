import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-muted/40 p-8">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold">
            Theme Preview
          </h1>
          <p className="text-sm text-muted-foreground">
            preset <code className="font-mono">b22nIIPhnU</code> 적용 결과를
            확인하는 페이지입니다.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>엘리베이터 호출</CardTitle>
            <CardDescription>
              버튼과 배지 색상으로 테마의 primary/secondary 팔레트를
              확인합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <Badge>default</Badge>
              <Badge variant="secondary">secondary</Badge>
              <Badge variant="outline">outline</Badge>
              <Badge variant="destructive">destructive</Badge>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="floor">목적 층</Label>
              <Input id="floor" placeholder="예: 12층" />
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2">
            <Button>default</Button>
            <Button variant="secondary">secondary</Button>
            <Button variant="outline">outline</Button>
            <Button variant="ghost">ghost</Button>
            <Button variant="destructive">destructive</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
