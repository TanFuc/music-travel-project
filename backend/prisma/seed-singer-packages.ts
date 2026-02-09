import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedSingerPackages() {
  console.log('🎵 Seeding singer packages...');

  const packages = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'GÓI Bm-V1 – KHỞI ĐẦU HÀNH TRÌNH CA SĨ',
      nameEn: 'BM-V1 - Singer Journey Starter Package',
      price: 1500000, // 1.5M VND
      description: 'Phù hợp với người mới bắt đầu hoặc muốn đánh thức lại đam mê ca hát trong môi trường chuyên nghiệp, an toàn và truyền cảm hứng.',
      benefits: [
        'Check năng khiếu & định hướng dòng nhạc phù hợp',
        'Thanh nhạc cơ bản – nhạc lý nền tảng',
        'Kỹ thuật biểu diễn sân khấu',
        'Thể hiện thành công 02 ca khúc yêu thích',
        'Biểu diễn tại 02 Đêm nhạc "Mãi cho Hành Tinh Xanh"',
        'Được 02 TVC cá nhân (quay – dựng – đăng kênh chương trình)'
      ],
      colorCode: '#3B82F6', // blue-500
      icon: 'star',
      displayOrder: 1,
      isActive: true,
      maxRegistrations: 50
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      name: 'GÓI Bm-V2 – PHÁT TRIỂN & TỎA SÁNG',
      nameEn: 'BM-V2 - Development & Shine Package',
      price: 3500000, // 3.5M VND
      description: 'Dành cho những ai muốn "đi xa hơn" chuyên nghiệp, làm chủ sân khấu và xây dựng hình ảnh cá nhân thông qua âm nhạc.',
      benefits: [
        'Thanh nhạc nâng cao – nhạc lý chuyên sâu',
        'Huấn luyện kỹ thuật biểu diễn sân khấu & ngoài trời',
        'Hoàn thiện 10 ca khúc biểu diễn',
        'Tham gia biểu diễn 10 Đêm nhạc (tối đa 03 bài/chương trình)',
        'Được 10 TVC cá nhân (quay – dựng – đăng kênh chương trình)'
      ],
      colorCode: '#8B5CF6', // purple-500
      icon: 'users',
      displayOrder: 2,
      isActive: true,
      maxRegistrations: 30
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      name: 'GÓI Bm-V3 – CHUYÊN NGHIỆP & THÀNH CÔNG',
      nameEn: 'BM-V3 - Professional & Success Package',
      price: 5500000, // 5.5M VND
      description: 'Dành cho những ai muốn trở thành ca sĩ chuyên nghiệp với đầy đủ kỹ năng và cơ hội phát triển sự nghiệp.',
      benefits: [
        'Thanh nhạc chuyên nghiệp – nhạc lý cao cấp',
        'Đào tạo kỹ thuật biểu diễn đa dạng (sân khấu, studio, outdoor)',
        'Hoàn thiện 20 ca khúc biểu diễn đa thể loại',
        'Tham gia biểu diễn 20 Đêm nhạc (không giới hạn số bài)',
        'Được 20 TVC cá nhân + 5 MV chuyên nghiệp',
        'Hỗ trợ phát hành âm nhạc trên các nền tảng số',
        'Mentoring 1-1 với ca sĩ nổi tiếng',
        'Cơ hội tham gia các dự án âm nhạc lớn'
      ],
      colorCode: '#F59E0B', // amber-500
      icon: 'crown',
      displayOrder: 3,
      isActive: true,
      maxRegistrations: 20
    }
  ];

  for (const packageData of packages) {
    await prisma.singerPackageTemplate.upsert({
      where: { id: packageData.id },
      update: packageData,
      create: packageData,
    });
  }

  console.log('✅ Singer packages seeded successfully');
}

export async function cleanupSingerPackages() {
  console.log('🧹 Cleaning up singer packages...');
  await prisma.singerPackageTemplate.deleteMany();
  console.log('✅ Singer packages cleaned up');
}