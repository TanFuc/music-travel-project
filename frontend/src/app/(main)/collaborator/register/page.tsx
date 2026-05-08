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
        <h1 className="mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text py-2 text-4xl font-extrabold leading-[1.1] tracking-tight text-transparent md:text-5xl lg:text-6xl">
          Đại Sứ Xanh
        </h1>
        <p className="mx-auto max-w-2xl text-xl text-neutral-600">
          Trở thành một phần của dự án "Mãi Cho Hành Tinh Xanh". Cùng lan tỏa niềm đam mê âm nhạc,
          du lịch bền vững và nhận những đặc quyền xứng đáng.
        </p>
      </div>

      <div className="mb-12 grid gap-8 md:grid-cols-3">
        <Card className="rounded-[2rem] border-emerald-100 bg-emerald-50/50">
          <CardHeader>
            <Wallet className="mb-4 h-12 w-12 text-emerald-600" />
            <CardTitle className="text-xl font-black">Cùng Tăng Thu Nhập</CardTitle>
            <CardDescription className="font-medium">
              Chính sách thưởng minh bạch, hấp dẫn cho mỗi hành trình và vé show được kết nối thành
              công.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="rounded-[2rem] border-teal-100 bg-teal-50/50">
          <CardHeader>
            <TrendingUp className="mb-4 h-12 w-12 text-teal-600" />
            <CardTitle className="text-xl font-black">Giá Trị Lan Tỏa</CardTitle>
            <CardDescription className="font-medium">
              Góp phần phát triển du lịch sinh thái và văn hóa nghệ thuật tại các địa phương trên
              khắp Việt Nam.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="rounded-[2rem] border-cyan-100 bg-cyan-50/50">
          <CardHeader>
            <Users className="mb-4 h-12 w-12 text-cyan-600" />
            <CardTitle className="text-xl font-black">Đội Ngũ Tri Thức</CardTitle>
            <CardDescription className="font-medium">
              Kết nối mạng lưới những người trẻ sống xanh, yêu nghệ thuật và du lịch trải nghiệm.
            </CardDescription>
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
            className="h-16 w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-12 text-xl font-black shadow-xl shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-700 md:w-auto"
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Đang xử lý...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6" />
                Đăng ký trở thành Đại Sứ Xanh
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
