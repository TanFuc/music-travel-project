'use client';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Users, Mic, Map, ArrowRight } from 'lucide-react';
import { Link } from '@/components/common/Link';
import { Button } from '@/components/ui/button';
export default function PartnersPage() {
  usePageTitle();
  const partnerOptions = [
    {
      title: 'Nghệ sĩ & Tài năng',
      description:
        'Cơ hội biểu diễn nghệ thuật trên sân khấu sinh thái, lan tỏa thông điệp sống xanh và kết nối cộng đồng.',
      icon: <Mic className="h-10 w-10 text-emerald-600" />,
      href: '/register-singer',
      color: 'bg-white border-emerald-100 hover:border-emerald-300',
      buttonClass: 'bg-emerald-600 hover:bg-emerald-700',
    },
    {
      title: 'Đối tác Du lịch & Nghỉ dưỡng',
      description:
        'Hợp tác phát triển du lịch trải nghiệm - sinh thái. Kết nối truyền thông, media và phân phối dịch vụ chuyên nghiệp.',
      icon: <Map className="h-10 w-10 text-emerald-600" />,
      href: '/register-tour',
      color: 'bg-white border-emerald-100 hover:border-emerald-300',
      buttonClass: 'bg-emerald-600 hover:bg-emerald-700',
    },
    {
      title: 'Đại sứ Xanh (Green Ambassador)',
      description:
        'Trở thành sứ giả lan tỏa lối sống bền vững, kết nối cộng đồng và nhận những đặc quyền hấp dẫn từ hệ sinh thái.',
      icon: <Users className="h-10 w-10 text-emerald-600" />,
      href: '/collaborator/register',
      color: 'bg-white border-emerald-100 hover:border-emerald-300',
      buttonClass: 'bg-emerald-600 hover:bg-emerald-700',
    },
  ];
  return (
    <div className="min-h-screen bg-slate-50 py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h1 className="mb-6 font-display text-3xl font-bold text-slate-900 md:text-5xl">
            Trở Thành <span className="text-brand-600">Đối Tác</span> Của Chúng Tôi
          </h1>
          <p className="text-lg text-slate-600">
            Khám phá các cơ hội hợp tác đa dạng và phát triển doanh thu cùng Mãi Cho Hành Tinh Xanh.
            Chọn hình thức đối tác phù hợp nhất với bạn.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {partnerOptions.map((option, index) => (
            <div
              key={index}
              className={`flex flex-col rounded-2xl border p-8 transition-all hover:-translate-y-1 hover:shadow-xl ${option.color}`}
            >
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-sm">
                {option.icon}
              </div>
              <h3 className="mb-3 text-2xl font-bold text-slate-900">{option.title}</h3>
              <p className="mb-8 flex-1 leading-relaxed text-slate-600">{option.description}</p>
              <Link href={option.href} className="mt-auto w-full">
                <Button
                  className={`${option.buttonClass} group h-12 w-full text-base font-semibold`}
                >
                  Đăng ký ngay
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-20 max-w-4xl rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm md:p-12">
          <h3 className="mb-4 text-xl font-bold text-slate-900 md:text-2xl">
            Bạn có đề xuất hợp tác khác?
          </h3>
          <p className="mb-6 inline-block max-w-2xl text-slate-600">
            Chúng tôi luôn chào đón các ý tưởng hợp tác mới. Nếu bạn là một tổ chức doanh nghiệp
            muốn tài trợ, liên kết chuyên sâu hoặc có bất kỳ đề xuất nào khác, vui lòng liên hệ trực
            tiếp với chúng tôi.
          </p>
          <div className="flex justify-center">
            <Link href="/about">
              <Button variant="outline" className="h-12 px-8">
                Liên hệ ngay
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
