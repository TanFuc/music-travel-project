'use client';
import { useState } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Check, Sparkles, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api';
export default function RegisterTourPage() {
  usePageTitle();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const { data: cmsConfig } = useQuery({
    queryKey: ['system-configs-tour-partner'],
    queryFn: () => get<Record<string, any>>('/system-configs/public'),
    staleTime: 10 * 60 * 1000,
  });
  const cms = cmsConfig?.['TOUR_PARTNER_CMS'] || {
    hero: {
      badge: 'Thư Mời Hợp Tác Chương Trình',
      titlePrefix: 'Mãi Cho',
      titleHighlight: 'Hành Tinh Xanh',
      description:
        'Kính gửi: Quý Đơn vị / Địa điểm Du lịch – Nghỉ dưỡng. Bizmall trân trọng mời hợp tác phát triển Du lịch trải nghiệm – Sinh thái – Bền vững gắn liền với dự án cộng đồng.',
    },
    scope: {
      title: 'Phạm vi & Nội dung',
      items: [
        {
          title: 'Phát triển Kênh MXH',
          desc: 'Xây dựng TikTok, Facebook, Youtube chuyên nghiệp',
        },
        {
          title: 'Sản xuất Media',
          desc: 'Video review trải nghiệm thực tế, tối ưu viral thu hút khách',
        },
        {
          title: 'Công nghệ Quản lý',
          desc: 'Chuẩn hoá mô hình, ứng dụng phần mềm vận hành minh bạch',
        },
        {
          title: 'Kênh Bán hàng Bizmall',
          desc: 'Phân phối combo, tour du lịch & thanh toán trực tuyến',
        },
        {
          title: 'Sự kiện Đêm nhạc',
          desc: 'Kết nối tổ chức sự kiện âm nhạc, hội nghị tại địa điểm',
        },
        {
          title: 'Gọi vốn đầu tư',
          desc: 'Hỗ trợ xây dựng kế hoạch và tổ chức gọi vốn phát triển',
        },
      ],
    },
    benefits: {
      title: 'Quyền lợi hợp tác',
      groups: [
        {
          title: 'Về Kinh doanh',
          items: [
            'Gia tăng khách hàng nhanh chóng',
            'Booking online trực tiếp',
            'Tour & Combo trải nghiệm',
            'Doanh thu sự kiện tại chỗ',
          ],
        },
        {
          title: 'Về Thương hiệu',
          items: [
            'Hình ảnh MXH chuyên nghiệp',
            'Điểm đến nổi bật & khác biệt',
            'Định vị Du lịch Xanh',
          ],
        },
        {
          title: 'Về Vận hành',
          items: [
            'Hệ thống QLBH hiện đại',
            'Quy trình báo cáo minh bạch',
            'Tối ưu năng suất nhân sự',
          ],
        },
        {
          title: 'Về Dài hạn',
          items: ['Hệ sinh thái Bizmall', 'Hoạt động cộng đồng', 'Phát triển bền vững'],
        },
      ],
    },
    packages: {
      title: 'Phương Thức Hợp Tác',
      description:
        'Bizmall đồng hành xây dựng Media và tổ chức bán sản phẩm dịch vụ chia sẻ lợi nhuận linh hoạt theo các gói:',
      items: [
        {
          id: 'G1',
          name: 'Kết nối',
          time: '10 ngày',
          price: 'Miễn phí',
          note: '(Quy đổi trải nghiệm)',
          features: [
            'Miễn phí phần mềm QLBH gắn TMĐT Bizmall.vn',
            'Thực hiện 1 video review địa điểm, sản phẩm dịch vụ',
            'Đăng tải đa nên tảng MXH và TMĐT Bizmall',
            'Hỗ trợ cập nhật và bán sản phẩm/dịch vụ chia sẻ lợi nhuận',
          ],
        },
        {
          id: 'G2',
          name: 'Media - Thương mại',
          time: '60 ngày',
          price: '5 triệu',
          features: [
            'Miễn phí phần mềm QLBH gắn TMĐT',
            'Thực hiện 5 video review địa điểm, giới thiệu SP/DV',
            'Xây dựng gói dịch vụ sản phẩm, vé, combo, tour trải nghiệm',
            'Đăng đa nền tảng MXH và TMĐT Bizmall',
            'Tổ chức bán hàng chia sẻ lợi nhuận (vé combo, tour)',
          ],
        },
        {
          id: 'G3',
          name: 'Media - Xây kênh - Thương mại (Đồng hành)',
          time: '90 ngày',
          price: '30 triệu',
          isPopular: true,
          features: [
            'Miễn phí phần mềm QLBH gắn TMĐT',
            'Thiết lập và phát triển kênh MXH TikTok, Fanpage, Youtube',
            'Quay dựng 30 video review địa điểm, giới thiệu SP/DV',
            'Chuẩn hoá quy trình vận hành hiện đại, chuyên nghiệp',
            'Xây dựng gói SP/DV, vé combo, tour trải nghiệm',
            'Xây dựng chương trình Đêm nhạc, kết nối hội nghị, hội thảo, tour khách đoàn',
            'Đăng đa nền tảng MXH và TMĐT Bizmall',
            'Tổ chức bán hàng chia sẻ lợi nhuận (vé, combo, tour)',
            'Tổ chức phiên livestream bán hàng (3 phiên)',
          ],
        },
        {
          id: 'G4',
          name: 'Media - Xây kênh - Thương mại - Gọi vốn (Chiến lược)',
          time: '12 tháng',
          price: '90 triệu',
          features: [
            'Miễn phí phần mềm QLBH gắn TMĐT',
            'Thiết lập phát triển kênh MXH TikTok, Fanpage, Youtube, Landing Page',
            'Quay dựng 100 video review địa điểm, giới thiệu SP/DV',
            'Chuẩn hoá quy trình vận hành chuyên nghiệp, hiện đại',
            'Xây dựng gói dịch vụ sản phẩm, vé combo, tour',
            'Xây dựng chương trình Đêm nhạc, kết nối hội nghị, hội thảo, tour khách đoàn',
            'Đăng đa nền tảng MXH và TMĐT Bizmall',
            'Tổ chức bán hàng chia sẻ lợi nhuận (vé, combo, tour)',
            'Tổ chức phiên livestream bán hàng tại địa điểm (15 phiên)',
            'Xây dựng chương trình kế hoạch gọi vốn đầu tư (nếu có)',
          ],
        },
      ],
    },
    form: {
      title: 'Đăng Ký Tư Vấn Trực Tuyến',
      description:
        'Hãy để lại thông tin, đội ngũ Bizmall sẽ liên hệ và khảo sát trực tiếp tại địa điểm của bạn.',
    },
    footer: {
      companyName: 'CÔNG TY CỔ PHẦN BIZMALL VIỆT NAM',
      contactInfo: 'Hotline: 0902 348 452 | Website: maichohanhtinhxanh.com',
    },
  };
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
            Cảm ơn bạn đã quan tâm hợp tác cùng Bizmall. Bộ phận phát triển dự án sẽ liên hệ lại qua
            số điện thoại/email trong vòng 24-48 giờ làm việc.
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
    <div className="min-h-screen bg-slate-50 pb-20 font-sans selection:bg-brand-100">
      <div className="relative overflow-hidden bg-slate-950 pb-32 pt-48 text-white md:pb-48 md:pt-64">
        <div className="absolute inset-0 z-0">
          <div className="absolute -left-10 -top-10 h-96 w-96 rounded-full bg-brand-600/20 blur-[120px]"></div>
          <div className="absolute -right-10 bottom-0 h-[500px] w-[500px] rounded-full bg-emerald-600/20 blur-[120px]"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        </div>
        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-2 text-sm font-bold text-brand-400 backdrop-blur-md">
            <Sparkles className="h-4 w-4" />
            <span className="uppercase tracking-widest">{cms.hero.badge}</span>
          </div>
          <h1 className="mb-10 text-5xl font-black tracking-tight text-white md:text-7xl lg:text-8xl">
            <span className="block text-white lg:inline">{cms.hero.titlePrefix}</span>
            <span className="bg-gradient-to-r from-brand-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
              {' '}
              {cms.hero.titleHighlight}
            </span>
          </h1>
          <p className="mx-auto max-w-4xl text-xl leading-relaxed text-slate-300 md:text-2xl">
            {cms.hero.description}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="group rounded-[2.5rem] border border-slate-200 bg-white p-8 transition-all hover:shadow-2xl md:p-12">
            <div className="mb-10 flex items-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-2xl font-black text-white shadow-lg shadow-brand-200">
                I
              </div>
              <h2 className="text-left text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
                {cms.scope.title}
              </h2>
            </div>
            <div className="grid gap-8 sm:grid-cols-2">
              {cms.scope.items.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="relative rounded-2xl border border-slate-50 bg-slate-50/50 p-6 text-left transition-colors group-hover:bg-white"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                    <Check className="h-6 w-6" />
                  </div>
                  <h4 className="mb-2 text-lg font-bold text-slate-900">{item.title}</h4>
                  <p className="text-sm leading-relaxed text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="group rounded-[2.5rem] border border-emerald-800 bg-emerald-950 p-8 text-white transition-all hover:shadow-2xl md:p-12">
            <div className="mb-10 flex items-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl font-black text-emerald-950 shadow-xl">
                II
              </div>
              <h2 className="text-left text-3xl font-black tracking-tight text-white drop-shadow-sm md:text-4xl">
                {cms.benefits.title}
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {cms.benefits.groups.map((group: any, idx: number) => (
                <div
                  key={idx}
                  className="rounded-3xl border border-white/10 bg-white/5 p-8 text-left backdrop-blur-sm transition-colors group-hover:bg-white/10"
                >
                  <h4 className="mb-4 text-xl font-black text-emerald-300 underline decoration-emerald-800 underline-offset-8">
                    {group.title}
                  </h4>
                  <ul className="space-y-3 text-sm font-medium text-slate-300">
                    {group.items.map((item: string, i: number) => (
                      <li key={i} className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="py-32">
          <div className="mb-20 text-center">
            <h2 className="mb-6 text-4xl font-black tracking-tight text-slate-900 md:text-6xl">
              {cms.packages.title}
            </h2>
            <div className="mx-auto mb-8 h-1.5 w-24 rounded-full bg-brand-600"></div>
            <p className="mx-auto max-w-3xl text-xl text-slate-600 md:text-2xl">
              {cms.packages.description}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {cms.packages.items.map((pkg: any) => {
              const isG4 = pkg.id === 'G4';
              const textPrimaryColor = isG4 ? 'text-white' : 'text-slate-900';
              const textSecondaryColor = isG4 ? 'text-slate-100' : 'text-slate-600';
              const badgeBg = isG4 ? 'bg-white/20' : 'bg-white shadow-sm';
              const basePkg = {
                color: 'border-slate-200 bg-white',
                accent: 'text-brand-600',
              };
              if (pkg.id === 'G2') {
                basePkg.accent = 'text-emerald-600';
              } else if (pkg.id === 'G3') {
                basePkg.color = 'border-amber-200 bg-amber-50/50';
                basePkg.accent = 'text-amber-600';
              } else if (pkg.id === 'G4') {
                basePkg.color = 'border-slate-800 bg-slate-950 shadow-2xl shadow-slate-950';
                basePkg.accent = 'text-amber-400';
              }
              return (
                <div
                  key={pkg.id}
                  className={`group relative flex flex-col rounded-[2rem] border p-10 transition-all hover:-translate-y-3 hover:shadow-2xl ${basePkg.color} text-left`}
                >
                  {pkg.isPopular && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-2 text-xs font-black uppercase tracking-widest text-white shadow-xl">
                      Khuyên dùng
                    </div>
                  )}
                  <div className="mb-6 flex items-center justify-between">
                    <span
                      className={`text-sm font-black uppercase tracking-widest ${basePkg.accent}`}
                    >
                      Gói {pkg.id}
                    </span>
                    <div
                      className={`rounded-xl px-4 py-1.5 text-xs font-black ${badgeBg} ${textPrimaryColor}`}
                    >
                      {pkg.time}
                    </div>
                  </div>

                  <h3 className={`mb-6 h-20 text-2xl font-black leading-tight ${textPrimaryColor}`}>
                    {pkg.name}
                  </h3>

                  <div
                    className={`border-current/10 mb-8 flex items-baseline gap-2 border-b pb-8 ${textPrimaryColor}`}
                  >
                    <span className="text-4xl font-black tracking-tighter">{pkg.price}</span>
                    {pkg.note && <span className={`text-sm font-bold opacity-60`}>{pkg.note}</span>}
                  </div>

                  <ul className="flex-1 space-y-5">
                    {pkg.features.map((feat: string, idx: number) => (
                      <li key={idx} className="flex gap-3 text-sm leading-relaxed">
                        <Check className={`h-5 w-5 shrink-0 ${basePkg.accent}`} />
                        <span className={`font-semibold ${textSecondaryColor}`}>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        <div
          id="register-form"
          className="relative mx-auto max-w-5xl overflow-hidden rounded-[3rem] border border-slate-200 bg-white p-8 shadow-2xl md:p-16 lg:p-20"
        >
          <div className="pointer-events-none absolute right-0 top-0 p-12 opacity-[0.03]">
            <Sparkles className="h-64 w-64 text-brand-600" />
          </div>

          <div className="relative z-10">
            <div className="mb-16 text-center">
              <h2 className="mb-6 text-4xl font-black text-slate-900 md:text-5xl">
                {cms.form.title}
              </h2>
              <p className="mx-auto max-w-2xl text-xl text-slate-600">{cms.form.description}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-3">
                  <Label
                    htmlFor="company"
                    className="block text-left text-sm font-black uppercase tracking-wider text-slate-500"
                  >
                    Tên Đơn vị / Địa điểm
                  </Label>
                  <Input
                    id="company"
                    required
                    placeholder="Tên khu du lịch, resort, khách sạn..."
                    className="h-16 rounded-2xl border-slate-200 bg-slate-50 px-6 text-lg focus:bg-white"
                  />
                </div>
                <div className="space-y-3">
                  <Label
                    htmlFor="name"
                    className="block text-left text-sm font-black uppercase tracking-wider text-slate-500"
                  >
                    Người liên hệ
                  </Label>
                  <Input
                    id="name"
                    defaultValue={user?.fullName || ''}
                    required
                    placeholder="Họ và tên..."
                    className="h-16 rounded-2xl border-slate-200 bg-slate-50 px-6 text-lg focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-3">
                  <Label
                    htmlFor="phone"
                    className="block text-left text-sm font-black uppercase tracking-wider text-slate-500"
                  >
                    Số điện thoại
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    placeholder="09xx xxx xxx"
                    className="h-16 rounded-2xl border-slate-200 bg-slate-50 px-6 text-lg focus:bg-white"
                  />
                </div>
                <div className="space-y-3">
                  <Label
                    htmlFor="email"
                    className="block text-left text-sm font-black uppercase tracking-wider text-slate-500"
                  >
                    Email liên hệ
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={user?.email || ''}
                    required
                    placeholder="name@company.com"
                    className="h-16 rounded-2xl border-slate-200 bg-slate-50 px-6 text-lg focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="message"
                  className="block text-left text-sm font-black uppercase tracking-wider text-slate-500"
                >
                  Ghi chú hoặc Đề xuất
                </Label>
                <Textarea
                  id="message"
                  rows={5}
                  placeholder="Chia sẻ thêm về quy mô hoặc nhu cầu hợp tác của bạn..."
                  className="resize-none rounded-[2rem] border-slate-200 bg-slate-50 p-8 text-lg focus:bg-white"
                />
              </div>

              <Button
                type="submit"
                className="h-20 w-full rounded-[2rem] bg-brand-600 text-2xl font-black text-white shadow-2xl shadow-brand-200 transition-all hover:scale-[1.02] hover:bg-brand-700 active:scale-[0.98]"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  <>
                    <Send className="mr-3 h-6 w-6" />
                    Gửi Thông Tin Đăng Ký
                  </>
                )}
              </Button>
              <div className="text-center text-sm font-medium text-slate-400">
                Bằng cách nhấn gửi, bạn đồng ý với chính sách bảo mật và điều khoản hợp tác của
                Bizmall Việt Nam.
              </div>
            </form>
          </div>
        </div>

        <div className="mt-32 text-center">
          <div className="mb-6 h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
          <p className="text-2xl font-black text-slate-900">{cms.footer.companyName}</p>
          <p className="mt-2 text-lg font-bold text-slate-500">{cms.footer.contactInfo}</p>
        </div>
      </div>
    </div>
  );
}
