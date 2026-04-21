import { PrismaClient, UserRole, ShowStatus, TicketStatus, TourScheduleStatus, VoucherDiscountType, BannerPosition, MediaType, MediaTargetType, SeatType, BookingStatus, PaymentStatus, BookingItemType, WalletTransactionType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { seedSingerPackages } from './seed-singer-packages';
import { seedPaymentMethods } from './seed-payment-methods';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data (in reverse order of dependencies)
  console.log('🧹 Cleaning existing data...');
  await prisma.paymentMethodConfig.deleteMany(); // Added
  await prisma.walletTransaction.deleteMany();
  await prisma.userWallet.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.review.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.bookingItem.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.voucher.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.ticketClass.deleteMany();
  await prisma.showArtist.deleteMany();
  await prisma.performanceSlot.deleteMany();
  await prisma.performanceRegistration.deleteMany();
  await prisma.performanceQRCode.deleteMany();
  await prisma.show.deleteMany();
  await prisma.physicalSeat.deleteMany();
  await prisma.stage.deleteMany();
  await prisma.tourSchedule.deleteMany();
  await prisma.tour.deleteMany();
  await prisma.ticketTier.deleteMany(); // Added
  await prisma.singerRegistration.deleteMany(); // Added
  await prisma.singerPackageTemplate.deleteMany(); // Added
  await prisma.artist.deleteMany();
  await prisma.media.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.marketingEvent.deleteMany();
  await prisma.location.deleteMany();
  await prisma.user.deleteMany();

  // ============================================================================
  // 1. CREATE USERS
  // ============================================================================
  console.log('👤 Creating users...');
  const passwordHash = await bcrypt.hash('password123', 10);

  const adminUser = await prisma.user.create({
    data: {
      phoneNumber: '0901234567',
      passwordHash,
      fullName: 'Admin User',
      email: 'admin@maichohanhtinhxanh.com',
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  const staffUser = await prisma.user.create({
    data: {
      phoneNumber: '0901234568',
      passwordHash,
      fullName: 'Staff User',
      email: 'staff@maichohanhtinhxanh.com',
      role: UserRole.STAFF,
      isActive: true,
    },
  });

  const users = await Promise.all([
    prisma.user.create({
      data: {
        phoneNumber: '0912345678',
        passwordHash,
        fullName: 'Nguyen Van An',
        email: 'an.nguyen@gmail.com',
        role: UserRole.USER,
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        phoneNumber: '0923456789',
        passwordHash,
        fullName: 'Tran Thi Binh',
        email: 'binh.tran@gmail.com',
        role: UserRole.USER,
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        phoneNumber: '0934567890',
        passwordHash,
        fullName: 'Le Van Cuong',
        email: 'cuong.le@gmail.com',
        role: UserRole.USER,
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        phoneNumber: '0945678901',
        passwordHash,
        fullName: 'Pham Thi Dung',
        email: 'dung.pham@gmail.com',
        role: UserRole.USER,
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        phoneNumber: '0956789012',
        passwordHash,
        fullName: 'Hoang Van Em',
        email: 'em.hoang@gmail.com',
        role: UserRole.USER,
        isActive: true,
      },
    }),
  ]);

  // Create wallets for users
  console.log('💰 Creating wallets...');
  await Promise.all([
    prisma.userWallet.create({ data: { userId: adminUser.id, balance: 10000000 } }),
    prisma.userWallet.create({ data: { userId: staffUser.id, balance: 5000000 } }),
    ...users.map((user) =>
      prisma.userWallet.create({
        data: { userId: user.id, balance: Math.floor(Math.random() * 5000000) + 500000 },
      })
    ),
  ]);

  // ============================================================================
  // 2. CREATE LOCATIONS
  // ============================================================================
  console.log('📍 Creating locations...');
  const locations = await Promise.all([
    prisma.location.create({
      data: {
        name: 'Đà Lạt',
        slug: 'da-lat',
        thumbnailUrl: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&h=500&fit=crop',
        latitude: 11.9404,
        longitude: 108.4583,
        createdBy: adminUser.id,
      },
    }),
    prisma.location.create({
      data: {
        name: 'Hà Nội',
        slug: 'ha-noi',
        thumbnailUrl: 'https://images.unsplash.com/photo-1604074131665-7a4b13870ab4?w=800&h=500&fit=crop',
        latitude: 21.0285,
        longitude: 105.8542,
        createdBy: adminUser.id,
      },
    }),
    prisma.location.create({
      data: {
        name: 'Sài Gòn',
        slug: 'sai-gon',
        thumbnailUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&h=500&fit=crop',
        latitude: 10.8231,
        longitude: 106.6297,
        createdBy: adminUser.id,
      },
    }),
    prisma.location.create({
      data: {
        name: 'Đà Nẵng',
        slug: 'da-nang',
        thumbnailUrl: 'https://images.unsplash.com/photo-1578271887552-5ac3a72752bc?w=800&h=500&fit=crop',
        latitude: 16.0544,
        longitude: 108.2022,
        createdBy: adminUser.id,
      },
    }),
    prisma.location.create({
      data: {
        name: 'Nha Trang',
        slug: 'nha-trang',
        thumbnailUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=500&fit=crop',
        latitude: 12.2388,
        longitude: 109.1967,
        createdBy: adminUser.id,
      },
    }),
    prisma.location.create({
      data: {
        name: 'Phú Quốc',
        slug: 'phu-quoc',
        thumbnailUrl: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800&h=500&fit=crop',
        latitude: 10.2899,
        longitude: 103.9840,
        createdBy: adminUser.id,
      },
    }),
    prisma.location.create({
      data: {
        name: 'Ninh Bình',
        slug: 'ninh-binh',
        thumbnailUrl: 'https://images.unsplash.com/photo-1583417267826-aebc4d1542e1?w=800&h=500&fit=crop',
        latitude: 20.2539,
        longitude: 105.9750,
        createdBy: adminUser.id,
      },
    }),
  ]);

  const [daLat, haNoi, saiGon, daNang, nhaTrang, phuQuoc, ninhBinh] = locations;

  // ============================================================================
  // 3. CREATE ARTISTS
  // ============================================================================
  console.log('🎤 Creating artists...');
  const artists = await Promise.all([
    prisma.artist.create({
      data: {
        name: 'Hà Anh Tuấn',
        bio: 'Ca sĩ nổi tiếng với giọng hát trầm ấm, được mệnh danh là "Hoàng tử tình ca".',
        socialLinks: { facebook: 'https://facebook.com/haanhtuan', instagram: 'https://instagram.com/haanhtuan' },
        createdBy: adminUser.id,
      },
    }),
    prisma.artist.create({
      data: {
        name: 'Mỹ Tâm',
        bio: 'Nữ ca sĩ hàng đầu Việt Nam, được mệnh danh là "Họa mi tóc nâu".',
        socialLinks: { facebook: 'https://facebook.com/mytam', instagram: 'https://instagram.com/mytam' },
        createdBy: adminUser.id,
      },
    }),
    prisma.artist.create({
      data: {
        name: 'Đen Vâu',
        bio: 'Rapper nổi tiếng với những bài hát về cuộc sống đời thường.',
        socialLinks: { facebook: 'https://facebook.com/denvau', youtube: 'https://youtube.com/denvau' },
        createdBy: adminUser.id,
      },
    }),
    prisma.artist.create({
      data: {
        name: 'Tùng Dương',
        bio: 'Ca sĩ với phong cách âm nhạc đa dạng, từ nhạc dân gian đến đương đại.',
        socialLinks: { facebook: 'https://facebook.com/tungduong' },
        createdBy: adminUser.id,
      },
    }),
    prisma.artist.create({
      data: {
        name: 'Hoàng Thùy Linh',
        bio: 'Ca sĩ kết hợp nhạc dân gian với hiện đại, nổi tiếng với "Để Mị nói cho mà nghe".',
        socialLinks: { facebook: 'https://facebook.com/hoangthuylinh', instagram: 'https://instagram.com/hoangthuylinh' },
        createdBy: adminUser.id,
      },
    }),
    prisma.artist.create({
      data: {
        name: 'Sơn Tùng M-TP',
        bio: 'Ca sĩ, nhạc sĩ trẻ với nhiều hit và lượng fan đông đảo.',
        socialLinks: { facebook: 'https://facebook.com/sontungmtp', instagram: 'https://instagram.com/sontungmtp' },
        createdBy: adminUser.id,
      },
    }),
    prisma.artist.create({
      data: {
        name: 'Trịnh Công Sơn Band',
        bio: 'Ban nhạc chuyên biểu diễn các ca khúc bất hủ của nhạc sĩ Trịnh Công Sơn.',
        socialLinks: { facebook: 'https://facebook.com/trinhcongsonband' },
        createdBy: adminUser.id,
      },
    }),
    prisma.artist.create({
      data: {
        name: 'Ngọt Band',
        bio: 'Ban nhạc indie nổi tiếng với những ca khúc acoustic đầy cảm xúc.',
        socialLinks: { facebook: 'https://facebook.com/ngotband', instagram: 'https://instagram.com/ngotband' },
        createdBy: adminUser.id,
      },
    }),
    prisma.artist.create({
      data: {
        name: 'Vũ.',
        bio: 'Ca sĩ indie với giọng hát trầm buồn và phong cách acoustic.',
        socialLinks: { facebook: 'https://facebook.com/vu.artist', instagram: 'https://instagram.com/vu.artist' },
        createdBy: adminUser.id,
      },
    }),
    prisma.artist.create({
      data: {
        name: 'Cá Hồi Hoang',
        bio: 'Ban nhạc indie với phong cách folk-rock đặc trưng.',
        socialLinks: { facebook: 'https://facebook.com/cahoihoang' },
        createdBy: adminUser.id,
      },
    }),
  ]);

  // ============================================================================
  // 4. CREATE STAGES
  // ============================================================================
  console.log('🎭 Creating stages...');
  const stages = await Promise.all([
    prisma.stage.create({
      data: {
        locationId: daLat.id,
        name: 'Thung Lũng Mây',
        address: 'Đường Khe Sanh, Phường 10, Đà Lạt',
        latitude: 11.9375,
        longitude: 108.4231,
        mapLink: 'https://maps.google.com/?q=11.9375,108.4231',
        createdBy: adminUser.id,
      },
    }),
    prisma.stage.create({
      data: {
        locationId: daLat.id,
        name: 'Mây In The Nest',
        address: 'Hẻm 42, Đường Trần Phú, Đà Lạt',
        latitude: 11.9412,
        longitude: 108.4385,
        mapLink: 'https://maps.google.com/?q=11.9412,108.4385',
        createdBy: adminUser.id,
      },
    }),
    prisma.stage.create({
      data: {
        locationId: saiGon.id,
        name: 'Sky Garden',
        address: 'Quận 1, TP. Hồ Chí Minh',
        latitude: 10.7769,
        longitude: 106.7009,
        mapLink: 'https://maps.google.com/?q=10.7769,106.7009',
        createdBy: adminUser.id,
      },
    }),
    prisma.stage.create({
      data: {
        locationId: haNoi.id,
        name: 'The Nest Hanoi',
        address: 'Tây Hồ, Hà Nội',
        latitude: 21.0683,
        longitude: 105.8234,
        mapLink: 'https://maps.google.com/?q=21.0683,105.8234',
        createdBy: adminUser.id,
      },
    }),
    prisma.stage.create({
      data: {
        locationId: daNang.id,
        name: 'Garden Stage Da Nang',
        address: 'Sơn Trà, Đà Nẵng',
        latitude: 16.1091,
        longitude: 108.2512,
        mapLink: 'https://maps.google.com/?q=16.1091,108.2512',
        createdBy: adminUser.id,
      },
    }),
    prisma.stage.create({
      data: {
        locationId: nhaTrang.id,
        name: 'Beach Stage Nha Trang',
        address: 'Trần Phú, Nha Trang',
        latitude: 12.2451,
        longitude: 109.1934,
        mapLink: 'https://maps.google.com/?q=12.2451,109.1934',
        createdBy: adminUser.id,
      },
    }),
  ]);

  const [thungLungMay, mayInTheNest, skyGarden, theNestHanoi, gardenStageDN, beachStageNT] = stages;

  // ============================================================================
  // 5. CREATE PHYSICAL SEATS FOR EACH STAGE
  // ============================================================================
  console.log('💺 Creating physical seats...');

  async function createSeatsForStage(stageId: number, zones: { name: string; rows: number; seatsPerRow: number; type: SeatType }[]) {
    const seats = [];
    let yPosition = 0;

    for (const zone of zones) {
      for (let row = 1; row <= zone.rows; row++) {
        for (let seat = 1; seat <= zone.seatsPerRow; seat++) {
          seats.push({
            stageId,
            zoneName: zone.name,
            rowName: String.fromCharCode(64 + row), // A, B, C...
            seatNumber: seat.toString(),
            type: zone.type,
            xPosition: seat * 30,
            yPosition: yPosition + row * 25,
          });
        }
      }
      yPosition += (zone.rows + 1) * 25;
    }

    await prisma.physicalSeat.createMany({ data: seats });
    return prisma.physicalSeat.findMany({ where: { stageId } });
  }

  // Thung Lung May - Large outdoor venue
  const thungLungMaySeats = await createSeatsForStage(thungLungMay.id, [
    { name: 'VIP', rows: 3, seatsPerRow: 15, type: SeatType.SEAT },
    { name: 'Standard', rows: 5, seatsPerRow: 20, type: SeatType.SEAT },
    { name: 'Standing', rows: 2, seatsPerRow: 30, type: SeatType.STANDING },
  ]);

  // May In The Nest - Smaller intimate venue
  const mayInTheNestSeats = await createSeatsForStage(mayInTheNest.id, [
    { name: 'VIP', rows: 2, seatsPerRow: 10, type: SeatType.SEAT },
    { name: 'Standard', rows: 4, seatsPerRow: 12, type: SeatType.SEAT },
  ]);

  // Sky Garden - Medium rooftop venue
  const skyGardenSeats = await createSeatsForStage(skyGarden.id, [
    { name: 'VIP', rows: 2, seatsPerRow: 12, type: SeatType.SEAT },
    { name: 'Standard', rows: 4, seatsPerRow: 15, type: SeatType.SEAT },
    { name: 'Standing', rows: 1, seatsPerRow: 25, type: SeatType.STANDING },
  ]);

  // The Nest Hanoi
  const theNestHanoiSeats = await createSeatsForStage(theNestHanoi.id, [
    { name: 'VIP', rows: 2, seatsPerRow: 10, type: SeatType.SEAT },
    { name: 'Standard', rows: 3, seatsPerRow: 15, type: SeatType.SEAT },
  ]);

  // Garden Stage Da Nang
  const gardenStageDNSeats = await createSeatsForStage(gardenStageDN.id, [
    { name: 'VIP', rows: 2, seatsPerRow: 12, type: SeatType.SEAT },
    { name: 'Standard', rows: 4, seatsPerRow: 18, type: SeatType.SEAT },
  ]);

  // Beach Stage Nha Trang
  const beachStageNTSeats = await createSeatsForStage(beachStageNT.id, [
    { name: 'VIP', rows: 2, seatsPerRow: 10, type: SeatType.SEAT },
    { name: 'Standard', rows: 3, seatsPerRow: 15, type: SeatType.SEAT },
    { name: 'Standing', rows: 2, seatsPerRow: 20, type: SeatType.STANDING },
  ]);

  // ============================================================================
  // 6. CREATE SHOWS
  // ============================================================================
  console.log('🎵 Creating shows...');

  const baseDate = new Date();
  const getDate = (daysFromNow: number) => {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + daysFromNow);
    date.setHours(20, 0, 0, 0);
    return date;
  };

  const shows = await Promise.all([
    // Show 1: Dem Nhac Trinh - Thung Lung May
    prisma.show.create({
      data: {
        stageId: thungLungMay.id,
        title: 'Đêm Nhạc Trịnh - Thung Lũng Mây',
        slug: 'dem-nhac-trinh-thung-lung-may',
        description: 'Đêm nhạc tưởng nhớ nhạc sĩ Trịnh Công Sơn với những ca khúc bất hủ, trong không gian Thung Lũng Mây đầy thơ mộng.',
        performTime: getDate(15),
        checkInTime: getDate(15),
        status: ShowStatus.UPCOMING,
        properties: { badge: ['HOT', 'VIP'], featured: true },
        metaTitle: 'Đêm Nhạc Trịnh - Thung Lũng Mây | Music Travel',
        metaDescription: 'Tham gia đêm nhạc Trịnh tại Thung Lũng Mây Đà Lạt',
        createdBy: adminUser.id,
      },
    }),
    // Show 2: Acoustic Night - May In The Nest
    prisma.show.create({
      data: {
        stageId: mayInTheNest.id,
        title: 'Acoustic Night - Mây In The Nest',
        slug: 'acoustic-night-may-in-the-nest',
        description: 'Đêm nhạc acoustic ấm cúng với những bản ballad nhẹ nhàng.',
        performTime: getDate(20),
        checkInTime: getDate(20),
        status: ShowStatus.UPCOMING,
        properties: { badge: ['NEW'], featured: true },
        createdBy: adminUser.id,
      },
    }),
    // Show 3: Jazz Under The Stars - Sky Garden
    prisma.show.create({
      data: {
        stageId: skyGarden.id,
        title: 'Jazz Under The Stars',
        slug: 'jazz-under-the-stars',
        description: 'Đêm nhạc Jazz đỉnh cao trên tầng thượng Sky Garden với view toàn thành phố.',
        performTime: getDate(25),
        checkInTime: getDate(25),
        status: ShowStatus.UPCOMING,
        properties: { badge: ['VIP'], featured: true },
        createdBy: adminUser.id,
      },
    }),
    // Show 4: Indie Night - The Nest Hanoi
    prisma.show.create({
      data: {
        stageId: theNestHanoi.id,
        title: 'Indie Night - Những Câu Chuyện Nhỏ',
        slug: 'indie-night-nhung-cau-chuyen-nho',
        description: 'Đêm nhạc indie với những nghệ sĩ underground nổi bật nhất.',
        performTime: getDate(32),
        checkInTime: getDate(32),
        status: ShowStatus.UPCOMING,
        properties: { badge: ['SOON'] },
        createdBy: adminUser.id,
      },
    }),
    // Show 5: Folk & Soul Night - Garden Stage Da Nang
    prisma.show.create({
      data: {
        stageId: gardenStageDN.id,
        title: 'Folk & Soul Night',
        slug: 'folk-soul-night',
        description: 'Đêm nhạc Folk & Soul đầy cảm xúc bên bờ biển Đà Nẵng.',
        performTime: getDate(40),
        checkInTime: getDate(40),
        status: ShowStatus.UPCOMING,
        properties: { badge: ['NEW'] },
        createdBy: adminUser.id,
      },
    }),
    // Show 6: Moonlight Serenade - Thung Lung May
    prisma.show.create({
      data: {
        stageId: thungLungMay.id,
        title: 'Moonlight Serenade',
        slug: 'moonlight-serenade',
        description: 'Đêm nhạc lãng mạn dưới ánh trăng tại Thung Lũng Mây.',
        performTime: getDate(45),
        checkInTime: getDate(45),
        status: ShowStatus.UPCOMING,
        properties: { badge: ['HOT', 'VIP'] },
        createdBy: adminUser.id,
      },
    }),
    // Show 7: Beach Sunset Concert - Nha Trang
    prisma.show.create({
      data: {
        stageId: beachStageNT.id,
        title: 'Beach Sunset Concert',
        slug: 'beach-sunset-concert',
        description: 'Concert hoàng hôn bên bãi biển Nha Trang tuyệt đẹp.',
        performTime: getDate(50),
        checkInTime: getDate(50),
        status: ShowStatus.UPCOMING,
        properties: { badge: ['HOT'] },
        createdBy: adminUser.id,
      },
    }),
    // Show 8: Electric Night - Sky Garden
    prisma.show.create({
      data: {
        stageId: skyGarden.id,
        title: 'Electric Night - EDM Party',
        slug: 'electric-night-edm-party',
        description: 'Đêm nhạc điện tử sôi động nhất Sài Gòn.',
        performTime: getDate(55),
        checkInTime: getDate(55),
        status: ShowStatus.UPCOMING,
        properties: { badge: ['HOT', 'NEW'] },
        createdBy: adminUser.id,
      },
    }),
  ]);

  // ============================================================================
  // 7A. CREATE TICKET TIERS (GLOBAL)
  // ============================================================================
  console.log('🎫 Creating global ticket tiers...');
  await Promise.all([
    prisma.ticketTier.create({
      data: {
        name: 'Vé Test 2K',
        price: 2000,
        description: 'Vé giá 2.000đ dùng cho test thanh toán.',
        benefits: 'Vé test.',
        colorCode: '#9E9E9E',
        priority: 1,
      },
    }),
    prisma.ticketTier.create({
      data: {
        name: 'Vé Hạt Xanh - Green Solo',
        price: 350000,
        description: 'Mỗi cá nhân là một "hạt mầm" lan tỏa lối sống xanh. Dành cho: Khách lẻ, bạn trẻ, người yêu âm nhạc.',
        benefits: 'Đồ uống + ăn nhẹ. Ghế ngồi khu Green Solo.',
        colorCode: '#4CAF50',
        priority: 1,
      },
    }),
    prisma.ticketTier.create({
      data: {
        name: 'Vé Gia Đình Xanh - Happy Green Family',
        price: 500000,
        description: 'Gắn kết gia đình - nuôi dưỡng ý thức bảo vệ môi trường cho trẻ nhỏ. Dành cho: Gia đình trẻ, phụ huynh (02 người lớn + 1 trẻ em).',
        benefits: 'Đồ uống + ăn nhẹ. Ghế ngồi khu Happy Green Family.',
        colorCode: '#8BC34A',
        priority: 2,
      },
    }),
    prisma.ticketTier.create({
      data: {
        name: 'Vé Tuổi Trẻ Xanh - Green Youth',
        price: 1000000,
        description: 'Nhiệt huyết - sáng tạo - hành động vì tương lai xanh. Dành cho: CLB sinh viên, nhóm bạn trẻ (05 người).',
        benefits: 'Đồ uống + ăn nhẹ. Ghế ngồi khu Green Youth.',
        colorCode: '#CDDC39',
        priority: 3,
      },
    }),
    prisma.ticketTier.create({
      data: {
        name: 'Vé Doanh Nghiệp Đồng Hành Xanh - Green Partner',
        price: 3000000,
        description: 'Doanh nghiệp chung tay vì cộng đồng & môi trường. Dành cho: Công ty, tổ chức (10 người).',
        benefits: 'Đồ uống + ăn nhẹ + rượu vang. Ghế ngồi khu Green Partner. Khu vực ngồi riêng, Check-in & truyền thông riêng.',
        colorCode: '#FF9800',
        priority: 4,
      },
    }),
    prisma.ticketTier.create({
      data: {
        name: 'Vé VIP Doanh Nhân Xanh - Green Business Class',
        price: 1000000,
        description: 'Đẳng cấp - kết nối - trách nhiệm xã hội. Dành cho: Doanh nhân, nhà tài trợ (1 người).',
        benefits: 'Đồ uống + ăn nhẹ + rượu vang + món khô. Ghế ngồi khu VIP - Green Business Class. Khu vực ngồi đẹp/riêng. Ưu tiên giao lưu - kết nối đối tác.',
        colorCode: '#FFD700',
        priority: 5,
      },
    }),
  ]);

  // Link artists to shows
  console.log('🎤 Linking artists to shows...');
  await Promise.all([
    prisma.showArtist.create({ data: { showId: shows[0].id, artistId: artists[6].id, isHeadline: true } }), // Trinh Cong Son Band
    prisma.showArtist.create({ data: { showId: shows[0].id, artistId: artists[0].id, isHeadline: false } }), // Ha Anh Tuan
    prisma.showArtist.create({ data: { showId: shows[1].id, artistId: artists[7].id, isHeadline: true } }), // Ngot Band
    prisma.showArtist.create({ data: { showId: shows[1].id, artistId: artists[8].id, isHeadline: false } }), // Vu.
    prisma.showArtist.create({ data: { showId: shows[2].id, artistId: artists[3].id, isHeadline: true } }), // Tung Duong
    prisma.showArtist.create({ data: { showId: shows[3].id, artistId: artists[9].id, isHeadline: true } }), // Ca Hoi Hoang
    prisma.showArtist.create({ data: { showId: shows[3].id, artistId: artists[8].id, isHeadline: false } }), // Vu.
    prisma.showArtist.create({ data: { showId: shows[4].id, artistId: artists[4].id, isHeadline: true } }), // Hoang Thuy Linh
    prisma.showArtist.create({ data: { showId: shows[5].id, artistId: artists[0].id, isHeadline: true } }), // Ha Anh Tuan
    prisma.showArtist.create({ data: { showId: shows[5].id, artistId: artists[1].id, isHeadline: false } }), // My Tam
    prisma.showArtist.create({ data: { showId: shows[6].id, artistId: artists[2].id, isHeadline: true } }), // Den Vau
    prisma.showArtist.create({ data: { showId: shows[7].id, artistId: artists[5].id, isHeadline: true } }), // Son Tung M-TP
  ]);

  // ============================================================================
  // 7. CREATE TICKET CLASSES AND TICKETS FOR EACH SHOW
  // ============================================================================
  console.log('🎫 Creating ticket classes and tickets...');

  async function createTicketsForShow(
    showId: number,
    stageSeats: { id: number; zoneName: string | null }[],
    ticketClassConfigs: { name: string; price: number; colorCode: string; zones: string[] }[]
  ) {
    for (const config of ticketClassConfigs) {
      const zoneSeats = stageSeats.filter(s => config.zones.includes(s.zoneName || ''));

      const ticketClass = await prisma.ticketClass.create({
        data: {
          showId,
          name: config.name,
          price: config.price,
          colorCode: config.colorCode,
          totalQuantity: zoneSeats.length,
        },
      });

      // Create tickets for each seat in this class
      const ticketData = zoneSeats.map((seat, index) => ({
        ticketCode: `TK${showId.toString().padStart(3, '0')}${ticketClass.id.toString().padStart(3, '0')}${(index + 1).toString().padStart(4, '0')}`,
        showId,
        ticketClassId: ticketClass.id,
        physicalSeatId: seat.id,
        status: TicketStatus.AVAILABLE,
      }));

      await prisma.ticket.createMany({ data: ticketData });
    }
  }

  // Thung Lung May shows
  await createTicketsForShow(shows[0].id, thungLungMaySeats, [
    { name: 'VIP', price: 500000, colorCode: '#FFD700', zones: ['VIP'] },
    { name: 'Standard', price: 350000, colorCode: '#4CAF50', zones: ['Standard'] },
    { name: 'Standing', price: 250000, colorCode: '#2196F3', zones: ['Standing'] },
  ]);

  await createTicketsForShow(shows[5].id, thungLungMaySeats, [
    { name: 'VIP', price: 600000, colorCode: '#FFD700', zones: ['VIP'] },
    { name: 'Standard', price: 400000, colorCode: '#4CAF50', zones: ['Standard'] },
    { name: 'Standing', price: 300000, colorCode: '#2196F3', zones: ['Standing'] },
  ]);

  // May In The Nest shows
  await createTicketsForShow(shows[1].id, mayInTheNestSeats, [
    { name: 'VIP', price: 450000, colorCode: '#FFD700', zones: ['VIP'] },
    { name: 'Standard', price: 299000, colorCode: '#4CAF50', zones: ['Standard'] },
  ]);

  // Sky Garden shows
  await createTicketsForShow(shows[2].id, skyGardenSeats, [
    { name: 'VIP', price: 650000, colorCode: '#FFD700', zones: ['VIP'] },
    { name: 'Standard', price: 450000, colorCode: '#4CAF50', zones: ['Standard'] },
    { name: 'Standing', price: 350000, colorCode: '#2196F3', zones: ['Standing'] },
  ]);

  await createTicketsForShow(shows[7].id, skyGardenSeats, [
    { name: 'VIP', price: 800000, colorCode: '#FFD700', zones: ['VIP'] },
    { name: 'Standard', price: 550000, colorCode: '#4CAF50', zones: ['Standard'] },
    { name: 'Standing', price: 400000, colorCode: '#2196F3', zones: ['Standing'] },
  ]);

  // The Nest Hanoi show
  await createTicketsForShow(shows[3].id, theNestHanoiSeats, [
    { name: 'VIP', price: 400000, colorCode: '#FFD700', zones: ['VIP'] },
    { name: 'Standard', price: 280000, colorCode: '#4CAF50', zones: ['Standard'] },
  ]);

  // Garden Stage Da Nang show
  await createTicketsForShow(shows[4].id, gardenStageDNSeats, [
    { name: 'VIP', price: 450000, colorCode: '#FFD700', zones: ['VIP'] },
    { name: 'Standard', price: 320000, colorCode: '#4CAF50', zones: ['Standard'] },
  ]);

  // Beach Stage Nha Trang show
  await createTicketsForShow(shows[6].id, beachStageNTSeats, [
    { name: 'VIP', price: 550000, colorCode: '#FFD700', zones: ['VIP'] },
    { name: 'Standard', price: 380000, colorCode: '#4CAF50', zones: ['Standard'] },
    { name: 'Standing', price: 280000, colorCode: '#2196F3', zones: ['Standing'] },
  ]);

  // ============================================================================
  // ============================================================================
  // 8. CREATE TOURS
  // ============================================================================
  console.log('🌄 Creating tours...');
  const tours = await Promise.all([
    prisma.tour.create({
      data: {
        title: 'Tour Đà Lạt 3N2Đ - Combo Vé Show Mây Lang Thang',
        slug: 'tour-da-lat-3n2d-combo-may-lang-thang',
        departureLocId: saiGon.id,
        destinationLocId: daLat.id,
        duration: '3 ngày 2 đêm',
        description: `
          <h3>Hành trình khám phá Đà Lạt</h3>
          <p>Tour kết hợp tham quan Đà Lạt và xem show âm nhạc tại Thung Lũng Mây.</p>
          <h4>Ngày 1: Sài Gòn - Đà Lạt</h4>
          <ul>
            <li>6h00: Khởi hành từ Sài Gòn</li>
            <li>12h00: Đến Đà Lạt, nhận phòng khách sạn</li>
            <li>14h00: Tham quan Thung Lũng Tình Yêu</li>
            <li>19h00: Check-in show Mây Lang Thang</li>
          </ul>
          <h4>Ngày 2: Khám phá Đà Lạt</h4>
          <ul>
            <li>Tham quan Đồi Chè Cầu Đất</li>
            <li>Thăm làng hoa Vạn Thành</li>
            <li>Khám phá chợ đêm Đà Lạt</li>
          </ul>
          <h4>Ngày 3: Đà Lạt - Sài Gòn</h4>
          <ul>
            <li>Tham quan Hồ Tuyền Lâm</li>
            <li>12h00: Khởi hành về Sài Gòn</li>
          </ul>
        `,
        properties: {
          includes: ['Xe đưa đón', 'Khách sạn 3*', 'Vé show', 'Bữa sáng', 'HDV'],
          excludes: ['Chi phí cá nhân', 'Bữa trưa, tối'],
          thumbnailUrl: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&h=500&fit=crop'
        },
        createdBy: adminUser.id,
      },
    }),
    prisma.tour.create({
      data: {
        title: 'Tour Hà Nội - Ninh Bình 2N1Đ + Show Acoustic',
        slug: 'tour-ha-noi-ninh-binh-2n1d',
        departureLocId: haNoi.id,
        destinationLocId: ninhBinh.id,
        duration: '2 ngày 1 đêm',
        description: `
          <h3>Khám phá Ninh Bình - Tràng An</h3>
          <p>Tour kết hợp tham quan di sản UNESCO và đêm nhạc acoustic.</p>
          <h4>Ngày 1</h4>
          <ul>
            <li>7h00: Khởi hành từ Hà Nội</li>
            <li>9h00: Đến Ninh Bình</li>
            <li>Tham quan Tràng An</li>
            <li>Thăm chùa Bái Đính</li>
            <li>19h00: Đêm nhạc Acoustic</li>
          </ul>
          <h4>Ngày 2</h4>
          <ul>
            <li>Khám phá Hang Múa</li>
            <li>Tham quan Tam Cốc</li>
            <li>15h00: Về Hà Nội</li>
          </ul>
        `,
        properties: {
          includes: ['Xe đưa đón', 'Khách sạn 3*', 'Vé show', 'Bữa sáng', 'HDV', 'Vé tham quan'],
          excludes: ['Chi phí cá nhân'],
          thumbnailUrl: 'https://images.unsplash.com/photo-1583417267826-aebc4d1542e1?w=800&h=500&fit=crop'
        },
        createdBy: adminUser.id,
      },
    }),
    prisma.tour.create({
      data: {
        title: 'Tour Phú Quốc 4N3Đ - Sunset Concert',
        slug: 'tour-phu-quoc-4n3d-sunset-concert',
        departureLocId: saiGon.id,
        destinationLocId: phuQuoc.id,
        duration: '4 ngày 3 đêm',
        description: `
          <h3>Thiên đường biển đảo Phú Quốc</h3>
          <p>Trải nghiệm đảo ngọc với concert hoàng hôn đặc biệt.</p>
          <h4>Ngày 1</h4>
          <li>Bay Sài Gòn - Phú Quốc</li>
          <li>Nhận phòng resort</li>
          <li>Tự do khám phá</li>
          <h4>Ngày 2</h4>
          <li>Tour 4 đảo</li>
          <li>Lặn ngắm san hô</li>
          <h4>Ngày 3</h4>
          <li>Tham quan VinWonders</li>
          <li>17h00: Sunset Concert</li>
          <h4>Ngày 4</h4>
          <li>Tự do mua sắm</li>
          <li>Bay về Sài Gòn</li>
        `,
        properties: {
          includes: ['Vé máy bay', 'Resort 4*', 'Vé show', 'Tour 4 đảo', 'Vé VinWonders'],
          excludes: ['Chi phí cá nhân', 'Bữa ăn ngoài tour'],
          thumbnailUrl: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800&h=500&fit=crop'
        },
        createdBy: adminUser.id,
      },
    }),
    prisma.tour.create({
      data: {
        title: 'Tour Đà Nẵng - Hội An 3N2Đ + Folk Night',
        slug: 'tour-da-nang-hoi-an-3n2d-folk-night',
        departureLocId: saiGon.id,
        destinationLocId: daNang.id,
        duration: '3 ngày 2 đêm',
        description: `
          <h3>Miền Trung thơ mộng</h3>
          <p>Khám phá Đà Nẵng - Hội An cùng đêm nhạc Folk đặc sắc.</p>
        `,
        properties: {
          includes: ['Vé máy bay', 'Khách sạn 4*', 'Vé show', 'Xe đưa đón'],
          excludes: ['Chi phí cá nhân'],
          thumbnailUrl: 'https://images.unsplash.com/photo-1578271887552-5ac3a72752bc?w=800&h=500&fit=crop'
        },
        createdBy: adminUser.id,
      },
    }),
    prisma.tour.create({
      data: {
        title: 'Tour Nha Trang 3N2Đ - Beach Concert',
        slug: 'tour-nha-trang-3n2d-beach-concert',
        departureLocId: saiGon.id,
        destinationLocId: nhaTrang.id,
        duration: '3 ngày 2 đêm',
        description: `
          <h3>Biển xanh Nha Trang</h3>
          <p>Nghỉ dưỡng biển kết hợp concert bãi biển.</p>
        `,
        properties: {
          includes: ['Xe giường nằm', 'Resort 4*', 'Vé show', 'Tour 3 đảo'],
          excludes: ['Chi phí cá nhân', 'Bữa ăn'],
          thumbnailUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=500&fit=crop'
        },
        createdBy: adminUser.id,
      },
    }),
  ]);

  // ============================================================================
  // 9. CREATE TOUR SCHEDULES
  // ============================================================================
  console.log('📅 Creating tour schedules...');

  for (const tour of tours) {
    const scheduleDates = [15, 22, 29, 36, 43, 50, 57, 64, 71, 78];
    const basePrice = tour.title.includes('Phú Quốc') ? 4590000 :
      tour.title.includes('3N2Đ') ? 2990000 : 1890000;

    for (let i = 0; i < scheduleDates.length; i++) {
      const startDate = new Date(baseDate);
      startDate.setDate(startDate.getDate() + scheduleDates[i]);

      await prisma.tourSchedule.create({
        data: {
          tourId: tour.id,
          startDate,
          price: basePrice + (i % 3) * 200000, // Price variation
          capacity: 20 + (i % 3) * 5,
          bookedCount: Math.floor(Math.random() * 10),
          status: TourScheduleStatus.OPEN,
        },
      });
    }
  }

  // ============================================================================
  // 10. CREATE BANNERS
  // ============================================================================
  console.log('🖼️ Creating banners...');
  await Promise.all([
    prisma.banner.create({
      data: {
        title: 'Đêm Nhạc Trịnh - Thung Lũng Mây',
        imageUrl: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1920&h=1080&fit=crop',
        mobileImageUrl: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=768&h=1024&fit=crop',
        actionLink: '/shows/dem-nhac-trinh-thung-lung-may',
        position: BannerPosition.HOME_MAIN_SLIDER,
        displayOrder: 1,
        isActive: true,
        createdBy: adminUser.id,
      },
    }),
    prisma.banner.create({
      data: {
        title: 'Acoustic Night - Mây In The Nest',
        imageUrl: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1920&h=1080&fit=crop',
        mobileImageUrl: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=768&h=1024&fit=crop',
        actionLink: '/shows/acoustic-night-may-in-the-nest',
        position: BannerPosition.HOME_MAIN_SLIDER,
        displayOrder: 2,
        isActive: true,
        createdBy: adminUser.id,
      },
    }),
    prisma.banner.create({
      data: {
        title: 'Tour Đà Lạt 3N2Đ - Combo Show',
        imageUrl: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&h=1080&fit=crop',
        mobileImageUrl: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=768&h=1024&fit=crop',
        actionLink: '/tours/tour-da-lat-3n2d-combo-may-lang-thang',
        position: BannerPosition.HOME_MAIN_SLIDER,
        displayOrder: 3,
        isActive: true,
        createdBy: adminUser.id,
      },
    }),
    prisma.banner.create({
      data: {
        title: 'Jazz Under The Stars',
        imageUrl: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=1920&h=1080&fit=crop',
        mobileImageUrl: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=768&h=1024&fit=crop',
        actionLink: '/shows/jazz-under-the-stars',
        position: BannerPosition.HOME_MAIN_SLIDER,
        displayOrder: 4,
        isActive: true,
        createdBy: adminUser.id,
      },
    }),
    prisma.banner.create({
      data: {
        title: 'Giảm 20% cho đơn hàng đầu tiên',
        imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=400&fit=crop',
        actionLink: '/vouchers',
        position: BannerPosition.HOME_MID_SECTION,
        displayOrder: 1,
        isActive: true,
        createdBy: adminUser.id,
      },
    }),
  ]);

  // ============================================================================
  // 11. CREATE VOUCHERS
  // ============================================================================
  console.log('🏷️ Creating vouchers...');
  await Promise.all([
    prisma.voucher.create({
      data: {
        code: 'WELCOME20',
        discountType: VoucherDiscountType.PERCENT,
        discountValue: 20,
        minOrderValue: 500000,
        maxDiscountAmount: 200000,
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        usageLimit: 1000,
        isActive: true,
        createdBy: adminUser.id,
      },
    }),
    prisma.voucher.create({
      data: {
        code: 'NEWYEAR2025',
        discountType: VoucherDiscountType.PERCENT,
        discountValue: 15,
        minOrderValue: 300000,
        maxDiscountAmount: 150000,
        startDate: new Date(),
        endDate: new Date('2025-02-28'),
        usageLimit: 500,
        isActive: true,
        createdBy: adminUser.id,
      },
    }),
    prisma.voucher.create({
      data: {
        code: 'TOUR100K',
        discountType: VoucherDiscountType.FIXED_AMOUNT,
        discountValue: 100000,
        minOrderValue: 1000000,
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        usageLimit: 200,
        isActive: true,
        createdBy: adminUser.id,
      },
    }),
    prisma.voucher.create({
      data: {
        code: 'VIP50K',
        discountType: VoucherDiscountType.FIXED_AMOUNT,
        discountValue: 50000,
        minOrderValue: 400000,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 300,
        isActive: true,
        createdBy: adminUser.id,
      },
    }),
    prisma.voucher.create({
      data: {
        code: 'FLASHSALE30',
        discountType: VoucherDiscountType.PERCENT,
        discountValue: 30,
        minOrderValue: 800000,
        maxDiscountAmount: 300000,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        usageLimit: 50,
        isActive: true,
        createdBy: adminUser.id,
      },
    }),
  ]);

  // ============================================================================
  // 12. CREATE MEDIA ENTRIES
  // ============================================================================
  console.log('📸 Creating media entries...');

  // Media for shows
  for (let i = 0; i < shows.length; i++) {
    const show = shows[i];
    const showImages = [
      'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=600&fit=crop',
    ];
    const secondaryImages = [
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1478147427282-58a87a120781?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1558618518-f1eca7c7f857?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop',
    ];

    await prisma.media.createMany({
      data: [
        {
          url: showImages[i % showImages.length],
          type: MediaType.IMAGE,
          targetType: MediaTargetType.SHOW,
          targetId: show.id,
          isFeatured: true,
          displayOrder: 1,
          createdBy: adminUser.id,
        },
        {
          url: secondaryImages[i % secondaryImages.length],
          type: MediaType.IMAGE,
          targetType: MediaTargetType.SHOW,
          targetId: show.id,
          isFeatured: false,
          displayOrder: 2,
          createdBy: adminUser.id,
        },
      ],
    });
  }

  // Media for stages
  const stageImages = [
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1598387181032-a3103a2db5b3?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1501612780327-45045538702b?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1486693326701-bd1ba982e959?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1598387181296-5c81f7cd78e5?w=800&h=500&fit=crop',
  ];
  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i];
    await prisma.media.create({
      data: {
        url: stageImages[i % stageImages.length],
        type: MediaType.IMAGE,
        targetType: MediaTargetType.STAGE,
        targetId: stage.id,
        isFeatured: true,
        displayOrder: 1,
        createdBy: adminUser.id,
      },
    });
  }

  // Media for artists
  const artistImages = [
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1485199433301-1046cb4e13e3?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1490376840453-5f616fbebe9b?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1524650359799-842906ca1c06?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1472653816316-3ad6f10a6592?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop',
  ];
  for (let i = 0; i < artists.length; i++) {
    const artist = artists[i];
    await prisma.media.create({
      data: {
        url: artistImages[i % artistImages.length],
        type: MediaType.IMAGE,
        targetType: MediaTargetType.ARTIST,
        targetId: artist.id,
        isFeatured: true,
        displayOrder: 1,
        createdBy: adminUser.id,
      },
    });
  }

  // ============================================================================
  // 13. CREATE MARKETING EVENTS
  // ============================================================================
  console.log('📣 Creating marketing events...');
  await Promise.all([
    prisma.marketingEvent.create({
      data: {
        title: 'Flash Sale Tết 2025',
        slug: 'flash-sale-tet-2025',
        thumbnailUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=400&fit=crop',
        summary: 'Giảm đến 30% tất cả vé show và tour nhân dịp Tết Nguyên Đán 2025',
        content: '<h2>Flash Sale Tết 2025</h2><p>Ưu đãi lớn nhất trong năm...</p>',
        startTime: new Date(),
        endTime: new Date('2025-02-15'),
        isActive: true,
        createdBy: adminUser.id,
      },
    }),
    prisma.marketingEvent.create({
      data: {
        title: 'Valentine Concert Series',
        slug: 'valentine-concert-series',
        thumbnailUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&h=400&fit=crop',
        summary: 'Chuỗi đêm nhạc lãng mạn dành cho các cặp đôi',
        content: '<h2>Valentine Concert Series</h2><p>Những đêm nhạc lãng mạn...</p>',
        startTime: new Date('2025-02-01'),
        endTime: new Date('2025-02-28'),
        isActive: true,
        createdBy: adminUser.id,
      },
    }),
  ]);

  // ============================================================================
  // 14. SEED SINGER PACKAGES
  // ============================================================================
  await seedSingerPackages();

  // ============================================================================
  // SUMMARY
  // ============================================================================
  const counts = {
    users: await prisma.user.count(),
    locations: await prisma.location.count(),
    artists: await prisma.artist.count(),
    stages: await prisma.stage.count(),
    physicalSeats: await prisma.physicalSeat.count(),
    shows: await prisma.show.count(),
    ticketClasses: await prisma.ticketClass.count(),
    tickets: await prisma.ticket.count(),
    tours: await prisma.tour.count(),
    tourSchedules: await prisma.tourSchedule.count(),
    banners: await prisma.banner.count(),
    vouchers: await prisma.voucher.count(),
    media: await prisma.media.count(),
    marketingEvents: await prisma.marketingEvent.count(),
    bookings: await prisma.booking.count(),
  };

  console.log('\n✅ Seed completed successfully!');
  console.log('📊 Summary:');
  console.log(`   👤 Users: ${counts.users}`);
  console.log(`   📍 Locations: ${counts.locations}`);
  console.log(`   🎤 Artists: ${counts.artists}`);
  console.log(`   🎭 Stages: ${counts.stages}`);
  console.log(`   💺 Physical Seats: ${counts.physicalSeats}`);
  console.log(`   🎵 Shows: ${counts.shows}`);
  console.log(`   🎫 Ticket Classes: ${counts.ticketClasses}`);
  console.log(`   🎟️ Tickets: ${counts.tickets}`);
  console.log(`   🌄 Tours: ${counts.tours}`);
  console.log(`   📅 Tour Schedules: ${counts.tourSchedules}`);
  console.log(`   🖼️ Banners: ${counts.banners}`);
  console.log(`   🏷️ Vouchers: ${counts.vouchers}`);
  console.log(`   📸 Media: ${counts.media}`);
  console.log(`   📣 Marketing Events: ${counts.marketingEvents}`);
  console.log(`   🛍️ Bookings: ${counts.bookings}`);
  console.log('\n🔑 Test credentials:');
  console.log('   Admin: 0901234567 / password123');
  console.log('   Staff: 0901234568 / password123');
  console.log('   User:  0912345678 / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
