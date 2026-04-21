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
            <h1 className="mb-4 text-4xl font-bold leading-tight text-gray-900 md:text-6xl">
              DỰ ÁN CHUỖI ĐÊM NHẠC
            </h1>
            <h2 className="mb-6 text-2xl font-semibold text-green-600 md:text-4xl">
              "MÃI CHO HÀNH TINH XANH"
            </h2>
            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-gray-700">
              Chuỗi đêm nhạc nghệ thuật cộng đồng, lan tỏa thông điệp bảo vệ môi trường, chống biến
              đổi khí hậu và sống hài hòa với thiên nhiên thông qua âm nhạc.
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
                  Dự án Chuỗi đêm nhạc "Mãi cho Hành Tinh Xanh" là chuỗi đêm nhạc nghệ thuật cộng
                  đồng, được tổ chức tại các khu du lịch sinh thái, Café vườn không gian xanh, vùng
                  làng quê, vùng biển – cao nguyên. Với mục tiêu lan tỏa thông điệp bảo vệ môi
                  trường, chống biến đổi khí hậu và sống hài hòa với thiên nhiên thông qua âm nhạc
                  và các hoạt động trải nghiệm thực tế.
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

      <section className="bg-gradient-to-r from-green-100 to-blue-100 px-4 py-16">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">TầM NHÌN DÀI HẠN</h2>
          </div>

          <Card className="border-green-300 shadow-xl">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="text-center">
                  <Badge
                    variant="secondary"
                    className="bg-green-200 px-6 py-2 text-lg text-green-800"
                  >
                    Chuỗi đêm nhạc sinh thái tiêu biểu tại Việt Nam
                  </Badge>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                  <div>
                    <h4 className="mb-4 text-xl font-semibold text-green-800">Mục tiêu hàng năm</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-600"></div>
                        <span>10 – 20 điểm đến xanh</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-600"></div>
                        <span>Quy mô từ 1000 người</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="mb-4 text-xl font-semibold text-blue-800">Hình thành</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                        <span>Cộng đồng "Mãi cho Hành Tinh Xanh"</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                        <span>Mạng lưới nghệ sĩ – doanh nghiệp – người trẻ sống xanh</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="rounded-lg bg-white p-6">
                  <h4 className="mb-4 text-center text-xl font-semibold text-gray-900">Tiến tới</h4>
                  <div className="grid gap-4 text-center md:grid-cols-3">
                    <div>
                      <Leaf className="mx-auto mb-2 h-8 w-8 text-green-600" />
                      <span className="text-gray-700">Quỹ môi trường</span>
                    </div>
                    <div>
                      <TreePine className="mx-auto mb-2 h-8 w-8 text-green-600" />
                      <span className="text-gray-700">Trồng rừng, bảo tồn</span>
                    </div>
                    <div>
                      <Users className="mx-auto mb-2 h-8 w-8 text-green-600" />
                      <span className="text-gray-700">Giáo dục môi trường</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="bg-gradient-to-r from-green-600 to-blue-600 px-4 py-20 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-3xl font-bold md:text-4xl">
            CÙNG CHÚNG TÔI XÂY DỰNG MỘT HÀNH TINH XANH
          </h2>
          <p className="mb-8 text-xl opacity-90">
            Hãy tham gia cùng chúng tôi trong hành trình âm nhạc vì môi trường
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <a
                href="/register-singer"
                className="rounded-full bg-white px-8 py-4 font-semibold text-green-600 shadow-xl transition-all hover:scale-105 hover:bg-gray-100"
              >
                Đăng ký làm ca sĩ
              </a>
              <a
                href="/register-tour"
                className="rounded-full bg-amber-500 px-8 py-4 font-semibold text-white shadow-xl transition-all hover:scale-105 hover:bg-amber-400"
              >
                Đăng ký tổ chức Tour
              </a>
              <a
                href="/collaborator/register"
                className="rounded-full bg-blue-500 px-8 py-4 font-semibold text-white shadow-xl transition-all hover:scale-105 hover:bg-blue-400"
              >
                Trở thành Cộng Tác Viên
              </a>
            </div>
            <div className="mt-8">
              <a
                href="/shows"
                className="inline-block rounded-full border-2 border-white/60 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-green-600"
              >
                Khám phá các đêm nhạc (Shows)
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
