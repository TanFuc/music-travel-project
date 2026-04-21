'use client';
import { useState } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Check, Map, Compass, Users, Sparkles, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'next/navigation';
export default function RegisterTourPage() {
  usePageTitle();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để gửi đơn đăng ký hợp tác');
      router.push('/login?redirect=/register-tour');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success('Gửi đơn đăng ký hợp tác thành công!');
    }, 1500);
  };
  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
            <Check className="h-10 w-10" />
          </div>
          <h2 className="mb-4 text-2xl font-bold text-slate-900">Đã Gửi Thành Công!</h2>
          <p className="mb-8 leading-relaxed text-slate-600">
            Cảm ơn bạn đã quan tâm hợp tác tổ chức Tour cùng chúng tôi. Bộ phận đối tác sẽ liên hệ
            lại qua số điện thoại/email trong vòng 24-48 giờ làm việc.
          </p>
          <Button
            className="h-12 w-full bg-emerald-600 font-semibold hover:bg-emerald-700"
            onClick={() => router.push('/')}
          >
            Trở về trang chủ
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-amber-50/30 pb-32 font-sans selection:bg-amber-100">
      <div className="relative overflow-hidden border-b border-amber-100/50 bg-white">
        <div className="absolute inset-0 bg-amber-50/50 opacity-70"></div>
        <div className="absolute right-0 top-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-amber-400/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-80 w-80 rounded-full bg-orange-400/10 blur-3xl"></div>

        <div className="container relative z-10 mx-auto px-4 pb-12 pt-16 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-sm font-semibold text-amber-700 shadow-sm">
            <Map className="h-4 w-4" />
            <span>Đối Tác Lữ Hành & Tổ Chức Tour</span>
          </div>
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
            Đăng Ký Tổ Chức
            <span className="mt-2 block bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
              Tour Du Lịch Xanh
            </span>
          </h1>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-gray-600">
            Trở thành đối tác chiến lược. Cùng chúng tôi thiết kế và khai thác các tuyến du lịch
            sinh thái kết hợp chuỗi sự kiện âm nhạc đỉnh cao.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2">
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-slate-900">Tại sao nên hợp tác?</h2>

            <div className="space-y-6">
              {[
                {
                  icon: Compass,
                  color: 'text-amber-600',
                  bg: 'bg-amber-100',
                  title: 'Độc Quyền Khai Thác',
                  desc: 'Trở thành đơn vị tổ chức lữ hành chính thức phân phối vé kết hợp tour cho show nhạc lớn.',
                },
                {
                  icon: Sparkles,
                  color: 'text-orange-600',
                  bg: 'bg-orange-100',
                  title: 'Nâng Tầm Thương Hiệu',
                  desc: 'Hình ảnh công ty du lịch của bạn được phủ sóng rộng rãi nhờ chiến dịch truyền thông của chuỗi sự kiện.',
                },
                {
                  icon: Users,
                  color: 'text-emerald-600',
                  bg: 'bg-emerald-100',
                  title: 'Data Khách Hàng Khổng Lồ',
                  desc: 'Tiếp cận tập khách hàng cao cấp, có sẵn nhu cầu du lịch kết hợp giải trí.',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.bg}`}
                  >
                    <item.icon className={`h-6 w-6 ${item.color}`} />
                  </div>
                  <div>
                    <h4 className="mb-1 text-xl font-bold text-slate-900">{item.title}</h4>
                    <p className="leading-relaxed text-slate-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 text-white">
              <div className="absolute right-0 top-0 p-8 opacity-10">
                <Map className="h-40 w-40" />
              </div>
              <h3 className="relative z-10 mb-4 text-2xl font-bold">Các Hình Thức Hợp Tác</h3>
              <ul className="relative z-10 space-y-3 text-slate-300">
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                  <span>Đối tác bán vé lẻ kèm theo dịch vụ di chuyển</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                  <span>Đại lý bao tiêu trọn gói Tour + Vé VIP</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                  <span>Đồng hành truyền thông và tài trợ địa điểm</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="relative rounded-3xl border border-slate-100/50 bg-white p-8 shadow-xl">
            <div className="absolute inset-x-0 top-0 h-2 rounded-t-3xl bg-gradient-to-r from-amber-500 to-orange-500"></div>
            <h3 className="mb-6 mt-2 text-2xl font-bold text-slate-900">Đăng Ký Tư Vấn</h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Tên Công Ty / Tổ chức</Label>
                  <Input id="company" required placeholder="Lữ hành ABC..." className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Người liên hệ</Label>
                  <Input
                    id="name"
                    defaultValue={user?.fullName || ''}
                    required
                    placeholder="Họ và tên..."
                    className="h-12"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input id="phone" type="tel" required placeholder="0912..." className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email liên hệ</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={user?.email || ''}
                    required
                    placeholder="email@congty.com"
                    className="h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Khu vực hoạt động mạnh nhất</Label>
                <Input
                  id="role"
                  placeholder="Ví dụ: Miền Nam, Đà Lạt, Miền Bắc..."
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Đề xuất hợp tác (Tùy chọn)</Label>
                <Textarea
                  id="message"
                  rows={4}
                  placeholder="Bạn quan tâm biểu diễn tour với quy mô khách bao nhiêu, hay mong muốn hợp tác theo hình thức nào?"
                  className="resize-none"
                />
              </div>

              <Button
                type="submit"
                className="h-14 w-full bg-gradient-to-r from-amber-600 to-orange-600 text-base font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5 hover:from-amber-700 hover:to-orange-700"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Gửi Đăng Ký
                  </>
                )}
              </Button>
              <p className="mt-4 text-center text-xs text-slate-500">
                Thông tin của bạn sẽ được bảo mật tuyệt đối theo chính sách của chúng tôi.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
