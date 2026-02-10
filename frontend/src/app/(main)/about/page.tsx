/**
 * About Page - SSG (Static Site Generation)
 * Fully static page with no dynamic data
 *
 * Features:
 * - Pre-rendered at build time
 * - Zero client-side JavaScript for content
 * - Maximum performance and SEO
 */

import { Metadata } from 'next';
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
  description: 'Tìm hiểu về dự án chuỗi đêm nhạc "Mãi Cho Hành Tinh Xanh" - nơi kết nối âm nhạc, môi trường và cộng đồng',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Music className="w-8 h-8 text-green-600" />
              <Heart className="w-10 h-10 text-green-600" />
              <Leaf className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight">
              DỰ ÁN CHUỖI ĐÊM NHẠC
            </h1>
            <h2 className="text-2xl md:text-4xl font-semibold text-green-600 mb-6">
              "MÃI CHO HÀNH TINH XANH"
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Chuỗi đêm nhạc nghệ thuật cộng đồng, lan tỏa thông điệp bảo vệ môi trường, 
              chống biến đổi khí hậu và sống hài hòa với thiên nhiên thông qua âm nhạc.
            </p>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <Card className="shadow-xl border-green-200">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Globe className="w-8 h-8 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-900">GIỚI THIỆU CHUNG</h2>
              </div>
              
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
                <p>
                  Dự án Chuỗi đêm nhạc "Mãi cho Hành Tinh Xanh" là chuỗi đêm nhạc nghệ thuật cộng đồng, 
                  được tổ chức tại các khu du lịch sinh thái, Café vườn không gian xanh, vùng làng quê, 
                  vùng biển – cao nguyên. Với mục tiêu lan tỏa thông điệp bảo vệ môi trường, chống biến đổi 
                  khí hậu và sống hài hòa với thiên nhiên thông qua âm nhạc và các hoạt động trải nghiệm thực tế.
                </p>

                <p>
                  Đêm nhạc "Mãi cho Hành Tinh Xanh" còn là không gian kết nối đặc biệt dành cho doanh nghiệp, 
                  doanh nhân, hộ kinh doanh, chủ cửa hàng, shop và các điểm bán hàng những con người đang 
                  ngày ngày tạo ra giá trị thật cho thị trường và cộng đồng.
                </p>

                <p>
                  Tại đêm nhạc, các doanh nhân, chủ shop, điểm bán không chỉ là khán giả, mà còn có cơ hội 
                  trực tiếp thể hiện ca khúc mình yêu thích trên sân khấu, cùng ban nhạc chuyên nghiệp, 
                  trong một không gian âm nhạc ấm áp – gần gũi – đầy cảm xúc.
                </p>

                <p>
                  Mỗi phần trình diễn được ghi hình, hậu kỳ chuyên nghiệp và dựng thành TVC cá nhân, 
                  giúp người tham gia lưu giữ khoảnh khắc ý nghĩa. Thể hiện hình ảnh người kinh doanh 
                  hiện đại tự tin – truyền cảm hứng – có chiều sâu và có thêm tư liệu truyền thông mang 
                  dấu ấn riêng, nhân văn và khác biệt.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Purpose */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Target className="w-8 h-8 text-green-600" />
              <h2 className="text-3xl font-bold text-gray-900">MỤC ĐÍCH</h2>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Environmental Purpose */}
            <Card className="border-green-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Leaf className="w-8 h-8 text-green-600" />
                  <h3 className="text-xl font-semibold text-green-800">Xã hội - Môi trường</h3>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Nâng cao nhận thức về biến đổi khí hậu và ô nhiễm môi trường</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Kêu gọi hành động giảm rác thải nhựa, sống xanh</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Bảo vệ rừng, nguồn nước, biển</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Phát triển kinh tế đi đôi với bảo vệ môi trường</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Cultural Purpose */}
            <Card className="border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Music className="w-8 h-8 text-blue-600" />
                  <h3 className="text-xl font-semibold text-blue-800">Văn hóa - Nghệ thuật</h3>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Tôn vinh giá trị truyền thống, ký ức làng quê Việt Nam</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Tạo không gian nghệ sĩ chia sẻ góc nhìn về môi trường</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Kết nối chân thật với khán giả</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Hình thành dòng sự kiện âm nhạc xanh bền vững</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Community Purpose */}
            <Card className="border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-8 h-8 text-purple-600" />
                  <h3 className="text-xl font-semibold text-purple-800">Cộng đồng - Du lịch</h3>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Gắn kết âm nhạc – du lịch sinh thái – văn hóa địa phương</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Quảng bá điểm đến xanh và sản vật địa phương</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Du lịch xanh, du lịch bền vững</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Phát triển kinh tế cho cộng đồng địa phương</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Meaning */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Heart className="w-8 h-8 text-red-500" />
              <h2 className="text-3xl font-bold text-gray-900">Ý NGHĨA DỰ ÁN</h2>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-red-200 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-red-800 mb-4">Đối với cộng đồng</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <Star className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Biến âm nhạc thành ngôn ngữ chung để gắn kết con người</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Star className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Chia sẻ trách nhiệm với Trái Đất</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Star className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Không chỉ "nghe nhạc" mà còn trải nghiệm – suy ngẫm – hành động</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-orange-200 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-orange-800 mb-4">Đối với thế hệ trẻ</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <Lightbulb className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span>Truyền cảm hứng sống có trách nhiệm, có chiều sâu</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Lightbulb className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span>Có ý thức với tương lai</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Lightbulb className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span>Xây dựng thế hệ người tiêu dùng – sáng tạo – lãnh đạo xanh</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-green-200 shadow-lg md:col-span-2">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-green-800 mb-4">Đối với doanh nghiệp & đối tác</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <Award className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Nền tảng thực hiện CSR – ESG – Trách nhiệm xã hội</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Award className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Xây dựng thương hiệu xanh, nhân văn</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Award className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Kết nối doanh nghiệp với cộng đồng một cách chân thật, không phô trương</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Organization Method */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">PHƯƠNG THỨC TỔ CHỨC</h2>
          </div>

          <div className="space-y-8">
            {/* Chain Model */}
            <Card className="border-blue-200 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Mountain className="w-8 h-8 text-blue-600" />
                  <h3 className="text-2xl font-semibold text-blue-800">Mô hình tổ chức chuỗi</h3>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <TreePine className="w-12 h-12 text-green-600 mx-auto mb-3" />
                    <h4 className="font-semibold text-green-800">Cao nguyên – rừng</h4>
                  </div>
                  <div className="text-center">
                    <Waves className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                    <h4 className="font-semibold text-blue-800">Biển – đảo</h4>
                  </div>
                  <div className="text-center">
                    <Heart className="w-12 h-12 text-red-600 mx-auto mb-3" />
                    <h4 className="font-semibold text-red-800">Miền quê – làng cổ</h4>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
                  <p className="text-center text-lg font-medium text-gray-800">
                    "Âm nhạc nuôi dưỡng tâm hồn – Thiên nhiên nuôi dưỡng sự sống."
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Scale */}
            <Card className="border-purple-200 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-purple-800 mb-4">Quy mô đề xuất</h3>
                <div className="grid md:grid-cols-2 gap-6">
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

      {/* Long-term Vision */}
      <section className="py-16 px-4 bg-gradient-to-r from-green-100 to-blue-100">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">TầM NHÌN DÀI HẠN</h2>
          </div>

          <Card className="shadow-xl border-green-300">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="text-center">
                  <Badge variant="secondary" className="text-lg px-6 py-2 bg-green-200 text-green-800">
                    Chuỗi đêm nhạc sinh thái tiêu biểu tại Việt Nam
                  </Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-xl font-semibold text-green-800 mb-4">Mục tiêu hàng năm</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        <span>10 – 20 điểm đến xanh</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        <span>Quy mô từ 1000 người</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xl font-semibold text-blue-800 mb-4">Hình thành</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span>Cộng đồng "Mãi cho Hành Tinh Xanh"</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span>Mạng lưới nghệ sĩ – doanh nghiệp – người trẻ sống xanh</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg">
                  <h4 className="text-xl font-semibold text-gray-900 mb-4 text-center">Tiến tới</h4>
                  <div className="grid md:grid-cols-3 gap-4 text-center">
                    <div>
                      <Leaf className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <span className="text-gray-700">Quỹ môi trường</span>
                    </div>
                    <div>
                      <TreePine className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <span className="text-gray-700">Trồng rừng, bảo tồn</span>
                    </div>
                    <div>
                      <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <span className="text-gray-700">Giáo dục môi trường</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            CÙNG CHÚNG TÔI XÂY DỰNG MỘT HÀNH TINH XANH
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Hãy tham gia cùng chúng tôi trong hành trình âm nhạc vì môi trường
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/register-singer" 
              className="bg-white text-green-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Đăng ký làm ca sĩ
            </a>
            <a 
              href="/shows" 
              className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-green-600 transition-colors"
            >
              Xem lịch diễn
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}