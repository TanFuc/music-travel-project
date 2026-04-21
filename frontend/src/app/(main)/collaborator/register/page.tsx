'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { post } from '@/lib/api';
import { Users, CheckCircle, TrendingUp, Wallet } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { Link } from '@/components/common/Link';
export default function CollaboratorRegisterPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (isAuthenticated && user?.isCollaborator) {
      router.replace('/collaborator/dashboard');
    }
  }, [isAuthenticated, router, user?.isCollaborator]);
  if (isAuthenticated && user?.isCollaborator) {
    return null;
  }
  const handleRegister = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để đăng ký');
      router.push('/login?redirect=/collaborator/register');
      return;
    }
    setLoading(true);
    try {
      const response = await post<{
        referralCode?: string;
      }>('/collaborator/register', {});
      toast.success('Đăng ký thành công! Chào mừng bạn gia nhập đội ngũ CTV.');
      useAuthStore.setState({
        user: {
          ...user!,
          isCollaborator: true,
          referralCode: response.referralCode || user?.referralCode,
        },
      });
      router.push('/collaborator/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra khi đăng ký');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-4xl font-bold text-transparent">
          Chương trình Cộng Tác Viên
        </h1>
        <p className="text-xl text-neutral-600">
          Kiếm thêm thu nhập không giới hạn cùng Music Travel
        </p>
      </div>

      <div className="mb-12 grid gap-8 md:grid-cols-3">
        <Card className="border-blue-100 bg-blue-50/50">
          <CardHeader>
            <Wallet className="mb-2 h-10 w-10 text-blue-600" />
            <CardTitle>Hoa hồng hấp dẫn</CardTitle>
            <CardDescription>
              Nhận ngay hoa hồng lên đến 100,000đ cho mỗi vé bán được.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-indigo-100 bg-indigo-50/50">
          <CardHeader>
            <TrendingUp className="mb-2 h-10 w-10 text-indigo-600" />
            <CardTitle>Thu nhập thụ động</CardTitle>
            <CardDescription>
              Không giới hạn số lượng vé, thu nhập tăng trưởng theo nỗ lực của bạn.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-purple-100 bg-purple-50/50">
          <CardHeader>
            <Users className="mb-2 h-10 w-10 text-purple-600" />
            <CardTitle>Mạng lưới rộng mở</CardTitle>
            <CardDescription>Kết nối cộng đồng yêu nhạc và du lịch trên toàn quốc.</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card className="overflow-hidden border-2 border-blue-600/20 shadow-xl">
        <div className="absolute left-0 top-0 h-2 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
        <CardHeader className="pt-10 text-center">
          <CardTitle className="text-2xl">Đăng ký ngay hôm nay</CardTitle>
          <CardDescription className="text-base">
            Chỉ với một cú click, bạn sẽ trở thành đối tác chính thức của chúng tôi.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-10">
          <Button
            size="lg"
            className="h-14 w-full bg-gradient-to-r from-blue-600 to-indigo-600 px-12 text-lg shadow-lg shadow-blue-600/20 hover:from-blue-700 hover:to-indigo-700 md:w-auto"
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Đang xử lý...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Đăng ký làm Cộng Tác Viên
              </span>
            )}
          </Button>
        </CardContent>
        <CardFooter className="justify-center border-t bg-neutral-50 py-6">
          <p className="text-sm text-neutral-500">
            Bằng việc đăng ký, bạn đồng ý với{' '}
            <Link href="/about" className="text-blue-600 underline">
              Điều khoản & Chính sách
            </Link>{' '}
            của chương trình đối tác.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
