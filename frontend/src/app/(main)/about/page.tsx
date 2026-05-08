import { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Music,
  Heart,
  Leaf,
  Users,
  Globe,
  TreePine,
  Waves,
  Mountain,
  Star,
  Target,
  Award,
  Lightbulb,
  ArrowRight,
  MapPin,
} from 'lucide-react';
export const metadata: Metadata = {
  title: 'Giới thiệu - Mãi Cho Hành Tinh Xanh',
  description:
    'Tìm hiểu về dự án chuỗi đêm nhạc "Mãi Cho Hành Tinh Xanh" - nơi kết nối âm nhạc, môi trường và cộng đồng',
};
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Du an Mai Cho Hanh Tinh Xanh la gi?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Day la chuoi dem nhac cong dong ket hop thong diep bao ve moi truong, du lich xanh va ket noi cong dong ben vung.',
      },
    },
    {
      '@type': 'Question',
      name: 'Ai co the tham gia chuong trinh?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Khach tham du, nghe si, doanh nghiep, cong dong dia phuong va nhung nguoi quan tam den song xanh deu co the tham gia.',
      },
    },
    {
      '@type': 'Question',
      name: 'Gia tri noi bat cua du an la gi?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Du an ket noi am nhac, van hoa va trach nhiem xa hoi, dong thoi tao tac dong tich cuc den nhan thuc moi truong va du lich ben vung.',
      },
    },
  ],
};
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <JsonLd data={faqSchema} />

      <section className="relative px-4 py-20">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <div className="mb-6 flex items-center justify-center gap-3">
              <Music className="h-8 w-8 text-green-600" />
              <Heart className="h-10 w-10 text-green-600" />
              <Leaf className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="mb-4 text-4xl font-bold uppercase leading-tight tracking-tighter text-gray-900 md:text-6xl">
              HỆ SINH THÁI
            </h1>
            <h2 className="mb-6 text-2xl font-black tracking-tight text-brand-600 md:text-5xl">
              "MÃI CHO HÀNH TINH XANH"
            </h2>
            <p className="mx-auto max-w-3xl text-lg font-medium leading-relaxed text-gray-700">
              Không chỉ là những đêm nhạc, chúng tôi xây dựng một hệ sinh thái kết nối Nghệ thuật,
              Du lịch trải nghiệm và Cộng đồng sống xanh – nơi mỗi hành trình đều góp phần bảo vệ
              tương lai của Trái Đất.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-green-200 shadow-xl">
            <CardContent className="p-8">
              <div className="mb-6 flex items-center gap-3">
                <Globe className="h-8 w-8 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-900">GIỚI THIỆU CHUNG</h2>
              </div>

              <div className="prose prose-lg max-w-none space-y-6 leading-relaxed text-gray-700">
                <p>
                  Hệ sinh thái "Mãi cho Hành Tinh Xanh" là sự giao thoa giữa nghệ thuật trình diễn
                  cộng đồng, du lịch sinh thái và các hoạt động bảo tồn. Được tổ chức tại những
                  không gian xanh tuyển chọn – từ vùng cao nguyên lộng gió đến những ngôi làng ven
                  biển yên bình – chúng tôi tạo ra những điểm chạm giúp con người quay về với thiên
                  nhiên, thấu hiểu và hành động vì một môi trường bền vững.
                </p>

                <p>
                  Đêm nhạc "Mãi cho Hành Tinh Xanh" còn là không gian kết nối đặc biệt dành cho
                  doanh nghiệp, doanh nhân, hộ kinh doanh, chủ cửa hàng, shop và các điểm bán hàng
                  những con người đang ngày ngày tạo ra giá trị thật cho thị trường và cộng đồng.
                </p>

                <p>
                  Tại đêm nhạc, các doanh nhân, chủ shop, điểm bán không chỉ là khán giả, mà còn có
                  cơ hội trực tiếp thể hiện ca khúc mình yêu thích trên sân khấu, cùng ban nhạc
                  chuyên nghiệp, trong một không gian âm nhạc ấm áp – gần gũi – đầy cảm xúc.
                </p>

                <p>
                  Mỗi phần trình diễn được ghi hình, hậu kỳ chuyên nghiệp và dựng thành TVC cá nhân,
                  giúp người tham gia lưu giữ khoảnh khắc ý nghĩa. Thể hiện hình ảnh người kinh
                  doanh hiện đại tự tin – truyền cảm hứng – có chiều sâu và có thêm tư liệu truyền
                  thông mang dấu ấn riêng, nhân văn và khác biệt.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <div className="mb-4 flex items-center justify-center gap-3">
              <Target className="h-8 w-8 text-green-600" />
              <h2 className="text-3xl font-bold text-gray-900">MỤC ĐÍCH</h2>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-green-200 shadow-lg transition-shadow hover:shadow-xl">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <Leaf className="h-8 w-8 text-green-600" />
                  <h3 className="text-xl font-semibold text-green-800">Xã hội - Môi trường</h3>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-green-600"></div>
                    <span>Nâng cao nhận thức về biến đổi khí hậu và ô nhiễm môi trường</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-green-600"></div>
                    <span>Kêu gọi hành động giảm rác thải nhựa, sống xanh</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-green-600"></div>
                    <span>Bảo vệ rừng, nguồn nước, biển</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-green-600"></div>
                    <span>Phát triển kinh tế đi đôi với bảo vệ môi trường</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-200 shadow-lg transition-shadow hover:shadow-xl">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <Music className="h-8 w-8 text-blue-600" />
                  <h3 className="text-xl font-semibold text-blue-800">Văn hóa - Nghệ thuật</h3>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-600"></div>
                    <span>Tôn vinh giá trị truyền thống, ký ức làng quê Việt Nam</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-600"></div>
                    <span>Tạo không gian nghệ sĩ chia sẻ góc nhìn về môi trường</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-600"></div>
                    <span>Kết nối chân thật với khán giả</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-600"></div>
                    <span>Hình thành dòng sự kiện âm nhạc xanh bền vững</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-purple-200 shadow-lg transition-shadow hover:shadow-xl">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <Users className="h-8 w-8 text-purple-600" />
                  <h3 className="text-xl font-semibold text-purple-800">Cộng đồng - Du lịch</h3>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-purple-600"></div>
                    <span>Gắn kết âm nhạc – du lịch sinh thái – văn hóa địa phương</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-purple-600"></div>
                    <span>Quảng bá điểm đến xanh và sản vật địa phương</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-purple-600"></div>
                    <span>Du lịch xanh, du lịch bền vững</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-purple-600"></div>
                    <span>Phát triển kinh tế cho cộng đồng địa phương</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <div className="mb-4 flex items-center justify-center gap-3">
              <Heart className="h-8 w-8 text-red-500" />
              <h2 className="text-3xl font-bold text-gray-900">Ý NGHĨA DỰ ÁN</h2>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <Card className="border-red-200 shadow-lg">
              <CardContent className="p-6">
                <h3 className="mb-4 text-xl font-semibold text-red-800">Đối với cộng đồng</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <Star className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                    <span>Biến âm nhạc thành ngôn ngữ chung để gắn kết con người</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Star className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                    <span>Chia sẻ trách nhiệm với Trái Đất</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Star className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                    <span>Không chỉ "nghe nhạc" mà còn trải nghiệm – suy ngẫm – hành động</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-orange-200 shadow-lg">
              <CardContent className="p-6">
                <h3 className="mb-4 text-xl font-semibold text-orange-800">Đối với thế hệ trẻ</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <Lightbulb className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-500" />
                    <span>Truyền cảm hứng sống có trách nhiệm, có chiều sâu</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Lightbulb className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-500" />
                    <span>Có ý thức với tương lai</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Lightbulb className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-500" />
                    <span>Xây dựng thế hệ người tiêu dùng – sáng tạo – lãnh đạo xanh</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-green-200 shadow-lg md:col-span-2">
              <CardContent className="p-6">
                <h3 className="mb-4 text-xl font-semibold text-green-800">
                  Đối với doanh nghiệp & đối tác
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <Award className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span>Nền tảng thực hiện CSR – ESG – Trách nhiệm xã hội</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Award className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span>Xây dựng thương hiệu xanh, nhân văn</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Award className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span>
                      Kết nối doanh nghiệp với cộng đồng một cách chân thật, không phô trương
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">PHƯƠNG THỨC TỔ CHỨC</h2>
          </div>

          <div className="space-y-8">
            <Card className="border-blue-200 shadow-lg">
              <CardContent className="p-8">
                <div className="mb-6 flex items-center gap-3">
                  <Mountain className="h-8 w-8 text-blue-600" />
                  <h3 className="text-2xl font-semibold text-blue-800">Mô hình tổ chức chuỗi</h3>
                </div>

                <div className="mb-6 grid gap-6 md:grid-cols-3">
                  <div className="text-center">
                    <TreePine className="mx-auto mb-3 h-12 w-12 text-green-600" />
                    <h4 className="font-semibold text-green-800">Cao nguyên – rừng</h4>
                  </div>
                  <div className="text-center">
                    <Waves className="mx-auto mb-3 h-12 w-12 text-blue-600" />
                    <h4 className="font-semibold text-blue-800">Biển – đảo</h4>
                  </div>
                  <div className="text-center">
                    <Heart className="mx-auto mb-3 h-12 w-12 text-red-600" />
                    <h4 className="font-semibold text-red-800">Miền quê – làng cổ</h4>
                  </div>
                </div>

                <div className="rounded-lg bg-gradient-to-r from-green-50 to-blue-50 p-6">
                  <p className="text-center text-lg font-medium text-gray-800">
                    "Âm nhạc nuôi dưỡng tâm hồn – Thiên nhiên nuôi dưỡng sự sống."
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 shadow-lg">
              <CardContent className="p-6">
                <h3 className="mb-4 text-xl font-semibold text-purple-800">Quy mô đề xuất</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Badge variant="secondary" className="mb-3 bg-purple-100 text-purple-800">
                      300 – 1.000 người/đêm
                    </Badge>
                    <p className="text-gray-700">Không chạy theo đại nhạc hội đông đúc</p>
                  </div>
                  <div>
                    <Badge variant="secondary" className="mb-3 bg-purple-100 text-purple-800">
                      Chất lượng trải nghiệm
                    </Badge>
                    <p className="text-gray-700">Ưu tiên cảm xúc sâu – không gian mở</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-20 text-center">
            <Badge className="mb-4 border-none bg-brand-50 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-brand-600">
              Our Vision
            </Badge>
            <h2 className="font-display text-4xl font-black uppercase tracking-tight text-gray-900 md:text-5xl">
              Tầm nhìn dài hạn
            </h2>
            <div className="mx-auto mt-4 h-1.5 w-24 rounded-full bg-brand-600" />
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="group relative rounded-[40px] border border-brand-100 bg-[#FDFDFF] p-8 shadow-sm transition-all hover:-translate-y-2 hover:shadow-xl">
              <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-600 text-white shadow-lg shadow-brand-600/30">
                <Globe className="h-8 w-8" />
              </div>
              <h3 className="mb-4 font-display text-xl font-bold text-gray-900">
                Tiêu biểu tại Việt Nam
              </h3>
              <p className="mb-6 text-sm leading-relaxed text-gray-600">
                Trở thành chuỗi đêm nhạc sinh thái tiêu biểu, biểu tượng của sự kết hợp giữa nghệ
                thuật và bảo tồn thiên nhiên.
              </p>
              <div className="flex items-center gap-2 border-t border-brand-50 pt-6">
                <div className="h-2 w-2 rounded-full bg-brand-400" />
                <span className="text-xs font-black uppercase tracking-widest text-brand-600">
                  Mục tiêu hằng năm
                </span>
              </div>
              <ul className="mt-4 space-y-3">
                <li className="flex items-center gap-3 text-sm font-semibold text-gray-800">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-50 text-[10px] text-brand-600">
                    01
                  </div>
                  10 – 20 điểm đến xanh
                </li>
                <li className="flex items-center gap-3 text-sm font-semibold text-gray-700">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-50 text-[10px] text-brand-600">
                    02
                  </div>
                  Quy mô từ 1.000 người
                </li>
              </ul>
            </div>

            <div className="group relative rounded-[40px] border border-brand-100 bg-[#FDFDFF] p-8 shadow-sm transition-all hover:-translate-y-2 hover:shadow-xl">
              <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="mb-4 font-display text-xl font-bold text-gray-900">
                Hình thành cộng đồng
              </h3>
              <p className="mb-6 text-sm leading-relaxed text-gray-600">
                Xây dựng hệ sinh thái bền vững nơi con người cùng nhau hành động vì một hành tinh
                xanh hơn.
              </p>
              <div className="flex items-center gap-2 border-t border-brand-50 pt-6">
                <div className="h-2 w-2 rounded-full bg-blue-400" />
                <span className="text-xs font-black uppercase tracking-widest text-blue-500">
                  Đối tượng kết nối
                </span>
              </div>
              <ul className="mt-4 space-y-3">
                <li className="flex items-center gap-3 text-sm font-semibold text-gray-800">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-[10px] text-blue-600">
                    01
                  </div>
                  Cộng đồng "Mãi cho Hành Tinh Xanh"
                </li>
                <li className="flex items-center gap-3 text-sm font-semibold text-gray-700">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-[10px] text-blue-600">
                    02
                  </div>
                  Mạng lưới Nghệ sĩ - Doanh nghiệp
                </li>
              </ul>
            </div>

            <div className="group relative rounded-[40px] bg-brand-900 p-8 text-white shadow-2xl shadow-brand-900/40 transition-all hover:-translate-y-2">
              <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-500 text-white shadow-lg shadow-brand-500/30">
                <Target className="h-8 w-8" />
              </div>
              <h3 className="mb-4 font-display text-xl font-bold text-white">
                Hướng tới tương lai
              </h3>
              <p className="mb-6 text-sm leading-relaxed text-white/80">
                Vươn tới những giá trị cốt lõi, bảo tồn tài nguyên cho thế hệ mai sau thông qua các
                quỹ đóng góp.
              </p>
              <div className="flex items-center gap-2 border-t border-white/10 pt-6">
                <div className="h-2 w-2 rounded-full bg-brand-400" />
                <span className="text-xs font-black uppercase tracking-widest text-brand-300">
                  Tầm nhìn tiến tới
                </span>
              </div>
              <ul className="mt-4 space-y-4">
                {[
                  { icon: Leaf, text: 'Quỹ môi trường' },
                  { icon: TreePine, text: 'Trồng rừng & Bảo tồn' },
                  { icon: Globe, text: 'Giáo dục môi trường' },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-semibold">
                    <item.icon className="h-4 w-4 text-brand-400" />
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-brand-950 px-4 py-24">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1600&q=80')] bg-cover bg-center opacity-30 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-950/50 via-brand-950 to-brand-950" />

        <div className="container relative z-10 mx-auto">
          <div className="mx-auto mb-20 max-w-3xl text-center">
            <h2 className="mb-6 font-display text-4xl font-black leading-[1.1] text-white md:text-5xl lg:text-6xl">
              CÙNG CHÚNG TÔI <br /> <span className="text-brand-400">XÂY DỰNG</span> HÀNH TINH XANH
            </h2>
            <p className="text-lg font-medium text-white/90">
              Hãy tham gia cùng chúng tôi trong hành trình âm nhạc vì môi trường. Mỗi bước đi của
              bạn đều góp phần làm thế giới tốt đẹp hơn.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: 'Đăng ký làm ca sĩ',
                href: '/register-singer',
                icon: Music,
                color: 'bg-indigo-500',
                desc: 'Tỏa sáng trên sân khấu sinh thái và lan tỏa thông điệp xanh.',
              },
              {
                title: 'Đăng ký tổ chức Tour',
                href: '/register-tour',
                icon: MapPin,
                color: 'bg-emerald-500',
                desc: 'Hợp tác cùng chúng tôi tổ chức những hành trình khám phá thiên nhiên.',
              },
              {
                title: 'Trở thành CTV',
                href: '/collaborator/register',
                icon: Heart,
                color: 'bg-rose-500',
                desc: 'Tham gia đội ngũ truyền thông và lan tỏa dự án đến cộng đồng.',
              },
              {
                title: 'Khám phá Shows',
                href: '/shows',
                icon: Star,
                color: 'bg-amber-500',
                desc: 'Thưởng thức những đêm nhạc live đầy cảm xúc giữa thiên nhiên.',
              },
            ].map((item) => (
              <a
                key={item.title}
                href={item.href}
                className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl transition-all hover:-translate-y-2 hover:border-white/30 hover:bg-white/20"
              >
                <div
                  className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${item.color} text-white shadow-lg`}
                >
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-display text-xl font-bold text-white transition-colors group-hover:text-brand-300">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-white/80">{item.desc}</p>
                <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-400 transition-all group-hover:text-brand-300">
                  Tham gia ngay <ArrowRight className="h-4 w-4" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
