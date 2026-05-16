import { Prisma, PrismaClient, UserRole, ShowStatus, TicketStatus, TourScheduleStatus, VoucherDiscountType, BannerPosition, MediaType, MediaTargetType, SeatType, BookingStatus, PaymentStatus, BookingItemType, WalletTransactionType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { seedSingerPackages } from './seed-singer-packages';
import { seedPaymentMethods } from './seed-payment-methods';
import { seedStaticPages } from './seed-static-pages';
import { loadShowSeedItemsFromMarkdown, loadTourSeedItemsFromMarkdown } from './content-seed-loader';

const prisma = new PrismaClient();

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

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
  await prisma.staticPage.deleteMany();
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
        name: 'Sơn Tùng M-TP',
        bio: 'Ca sĩ, nhạc sĩ trẻ với nhiều hit và lượng fan đông đảo.',
        socialLinks: { facebook: 'https://facebook.com/sontungmtp', instagram: 'https://instagram.com/sontungmtp' },
        createdBy: adminUser.id,
      },
    }),
    prisma.artist.create({
      data: {
        name: 'Vicky Nhung',
        bio: 'Nữ ca sĩ với giọng hát đầy nội lực và phong cách âm nhạc cá tính.',
        socialLinks: { facebook: 'https://facebook.com/vickynhung' },
        createdBy: adminUser.id,
      },
    }),
    prisma.artist.create({
      data: {
        name: 'Trung Quân Idol',
        bio: 'Được mệnh danh là "Thánh mưa" với những bản ballad da diết.',
        socialLinks: { facebook: 'https://facebook.com/trungquanidol' },
        createdBy: adminUser.id,
      },
    }),
    prisma.artist.create({
      data: {
        name: 'Vũ Cát Tường',
        bio: 'Nghệ sĩ đa năng với khả năng sáng tác và biểu diễn độc đáo.',
        socialLinks: { facebook: 'https://facebook.com/vucattuong' },
        createdBy: adminUser.id,
      },
    }),
    prisma.artist.create({
      data: {
        name: 'S.T Sơn Thạch',
        bio: 'Nam ca sĩ, diễn viên với phong cách biểu diễn sôi động.',
        socialLinks: { facebook: 'https://facebook.com/stsonthach' },
        createdBy: adminUser.id,
      },
    }),
    prisma.artist.create({
      data: {
        name: 'Thành Vá',
        bio: 'Giọng ca đặc biệt với những bản cover đầy cảm xúc.',
        socialLinks: { facebook: 'https://facebook.com/thanhva' },
        createdBy: adminUser.id,
      },
    }),
    prisma.artist.create({
      data: {
        name: 'Chu Thúy Quỳnh',
        bio: 'Nữ ca sĩ sở hữu giọng hát lạ và đầy cuốn hút.',
        socialLinks: { facebook: 'https://facebook.com/chuthuyquynh' },
        createdBy: adminUser.id,
      },
    }),
    prisma.artist.create({
      data: {
        name: 'Đinh Tùng Huy',
        bio: 'Chủ nhân của nhiều bản hit triệu view trên mạng xã hội.',
        socialLinks: { facebook: 'https://facebook.com/dinhtunghuy' },
        createdBy: adminUser.id,
      },
    }),
    prisma.artist.create({
      data: {
        name: 'Hồ Trung Dũng',
        bio: 'Nam ca sĩ với phong cách lịch lãm và giọng hát truyền cảm.',
        socialLinks: { facebook: 'https://facebook.com/hotrungdung' },
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

    const showSeedItems = loadShowSeedItemsFromMarkdown();
  const showSlugs = new Set<string>();

  const resolveStageId = (city: string, index: number) => {
    const normalized = city.toLowerCase();
    if (normalized.includes('ha noi')) return theNestHanoi.id;
    if (normalized.includes('da nang')) return gardenStageDN.id;
    if (normalized.includes('nha trang')) return beachStageNT.id;
    if (normalized.includes('ho chi minh') || normalized.includes('sai gon')) return skyGarden.id;
    if (normalized.includes('da lat')) return thungLungMay.id;
    return [thungLungMay.id, mayInTheNest.id, skyGarden.id, theNestHanoi.id, gardenStageDN.id, beachStageNT.id][index % 6];
  };

  const shows = await Promise.all(
    showSeedItems.map((item, index) => {
      const dedupSlug = showSlugs.has(item.slug) ? `${item.slug}-${index + 1}` : item.slug;
      showSlugs.add(dedupSlug);

      const normalizedTicketTypes = item.ticketTypes.length
        ? item.ticketTypes
        : [{ name: 'Vé tiêu chuẩn', price: 199000, imageUrl: '' }];

      return prisma.show.create({
        data: {
          stageId: resolveStageId(item.city, index),
          title: item.title,
          slug: dedupSlug,
          description: item.description || `<p>${item.title}</p>`,
          performTime: item.performTime,
          checkInTime: item.checkInTime,
          status: item.performTime > new Date() ? ShowStatus.UPCOMING : ShowStatus.ONGOING,
          properties: {
            featured: index < 6,
            locationText: item.locationText,
            thumbnailUrl: item.thumbnailUrl,
            ticketTypes: normalizedTicketTypes as unknown as Prisma.InputJsonValue,
          },
          metaTitle: `${item.title} | FSell`,
          metaDescription: item.locationText || item.title,
          createdBy: adminUser.id,
        },
      });
    })
  );

  // Link artists to shows
  console.log('🎤 Linking artists to shows...');
  await Promise.all(
    shows.map((show) => {
      // Find matching artists based on title
      const matchingArtists = artists.filter((artist) =>
        show.title.toLowerCase().includes(artist.name.toLowerCase())
      );

      if (matchingArtists.length > 0) {
        return Promise.all(
          matchingArtists.map((artist) =>
            prisma.showArtist.create({
              data: {
                showId: show.id,
                artistId: artist.id,
                isHeadline: true,
              },
            })
          )
        );
      }

      // Fallback: Link a random artist if no match found
      const randomIndex = Math.floor(Math.random() * artists.length);
      return prisma.showArtist.create({
        data: {
          showId: show.id,
          artistId: artists[randomIndex].id,
          isHeadline: true,
        },
      });
    })
  );

  // ============================================================================
  // 7. CREATE TICKET CLASSES AND TICKETS FOR EACH SHOW
  // ============================================================================
  console.log('🎫 Creating ticket classes and tickets...');

  async function createGeneralAdmissionTicketsForShow(
    showId: number,
    ticketClassConfigs: { name: string; price: number; colorCode: string }[]
  ) {
    const quantityPerClass = 120;

    for (const config of ticketClassConfigs) {
      const ticketClass = await prisma.ticketClass.create({
        data: {
          showId,
          name: config.name,
          price: config.price,
          colorCode: config.colorCode,
          totalQuantity: quantityPerClass,
        },
      });

      const ticketData = Array.from({ length: quantityPerClass }, (_, index) => ({
        ticketCode: `TK${showId.toString().padStart(3, '0')}${ticketClass.id.toString().padStart(3, '0')}${(index + 1).toString().padStart(4, '0')}`,
        showId,
        ticketClassId: ticketClass.id,
        status: TicketStatus.AVAILABLE,
      }));

      await prisma.ticket.createMany({ data: ticketData });
    }
  }

  const classColors = ['#D97706', '#0EA5E9', '#059669', '#7C3AED', '#F43F5E', '#F59E0B'];

  for (let i = 0; i < shows.length; i += 1) {
    const item = showSeedItems[i];
    const ticketTypes = item.ticketTypes.length
      ? item.ticketTypes
      : [{ name: 'Vé tiêu chuẩn', price: 199000 }];

    await createGeneralAdmissionTicketsForShow(
      shows[i].id,
      ticketTypes.map((ticketType, index) => ({
        name: ticketType.name,
        price: ticketType.price,
        colorCode: classColors[index % classColors.length],
      }))
    );
  }

  // ============================================================================
  // ==========================================================================
  // 8. CREATE TOURS
  // ============================================================================
  console.log('🌄 Creating tours...');
  const tourSeedItems = loadTourSeedItemsFromMarkdown();
  const tourSlugs = new Set<string>();

  const resolveLocationId = (city: string) => {
    const normalized = city.toLowerCase();
    if (normalized.includes('ha noi')) return haNoi.id;
    if (normalized.includes('da nang')) return daNang.id;
    if (normalized.includes('nha trang') || normalized.includes('khanh hoa')) return nhaTrang.id;
    if (normalized.includes('ninh binh')) return ninhBinh.id;
    if (normalized.includes('da lat') || normalized.includes('lam dong')) return daLat.id;
    if (normalized.includes('phu quoc') || normalized.includes('kien giang')) return phuQuoc.id;
    if (normalized.includes('ho chi minh') || normalized.includes('sai gon')) return saiGon.id;
    return saiGon.id;
  };

  const tours = await Promise.all(
    tourSeedItems.map((item, index) => {
      const dedupSlug = tourSlugs.has(item.slug) ? `${item.slug}-${index + 1}` : item.slug;
      tourSlugs.add(dedupSlug);

      const ticketTypes = item.ticketTypes.length
        ? item.ticketTypes
        : [{ name: 'Gói tiêu chuẩn', price: 599000, imageUrl: '' }];

      const minPrice = Math.min(...ticketTypes.map((ticketType) => ticketType.price));

      return prisma.tour.create({
        data: {
          title: item.title,
          slug: dedupSlug,
          departureLocId: saiGon.id,
          destinationLocId: resolveLocationId(item.city),
          duration: '1 ngày',
          isCombo: false,
          minPrice,
          description: item.description || `<p>${item.title}</p>`,
          properties: {
            locationText: item.locationText,
            thumbnailUrl: item.thumbnailUrl,
            ticketTypes: ticketTypes as unknown as Prisma.InputJsonValue,
          },
          createdBy: adminUser.id,
        },
      });
    })
  );

  // ============================================================================
  // 8B. CREATE COMBOS (Tour + Show)
  // ============================================================================
  console.log('🎼 Creating combos (Tour + Show)...');
  const comboSeedCount = Math.min(5, tours.length, shows.length, tourSeedItems.length, showSeedItems.length);
  const comboSlugSet = new Set<string>();

  const combos = await Promise.all(
    Array.from({ length: comboSeedCount }, (_, index) => {
      const tourEntity = tours[index];
      const showEntity = shows[index];
      const tourSeed = tourSeedItems[index];
      const showSeed = showSeedItems[index];

      const comboTitle = `Combo ${tourSeed.title} + ${showSeed.title}`;
      const baseSlug = toSlug(comboTitle);
      const slug = comboSlugSet.has(baseSlug) ? `${baseSlug}-${index + 1}` : baseSlug;
      comboSlugSet.add(slug);

      const comboTicketTypes = showSeed.ticketTypes.length
        ? showSeed.ticketTypes
        : tourSeed.ticketTypes.length
          ? tourSeed.ticketTypes
          : [{ name: 'Gói combo tiêu chuẩn', price: 999000, imageUrl: '' }];

      const comboMinPrice = Math.min(...comboTicketTypes.map((ticketType) => ticketType.price));
      const thumbnailUrl = tourSeed.thumbnailUrl || showSeed.thumbnailUrl;

      return prisma.tour.create({
        data: {
          title: comboTitle,
          slug,
          departureLocId: tourEntity.departureLocId,
          destinationLocId: tourEntity.destinationLocId,
          duration: tourEntity.duration || '2 ngày 1 đêm',
          isCombo: true,
          linkedShowId: showEntity.id,
          minPrice: comboMinPrice,
          description: `<p>${comboTitle}</p>`,
          properties: {
            locationText: tourSeed.locationText,
            thumbnailUrl,
            ticketTypes: comboTicketTypes as unknown as Prisma.InputJsonValue,
          },
          createdBy: adminUser.id,
        },
      });
    }),
  );

  // ============================================================================
  // 9. CREATE TOUR SCHEDULES
  // ============================================================================
  console.log('📅 Creating tour schedules...');

  const baseDate = new Date();
  const allToursAndCombos = [...tours, ...combos];
  for (const tour of allToursAndCombos) {
    const scheduleDates = [15, 22, 29, 36, 43, 50, 57, 64, 71, 78];
    const basePrice = Number(tour.minPrice) || 1890000;

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
        title: 'Đêm Nhạc Ca Sĩ Thành Vá - Hồ Chí Minh',
        imageUrl: 'https://bizmall.world/st/uploads/show/2026/04/22/69e830e5058ac.jpeg',
        actionLink: '/shows/ca-si-thanh-va',
        location: '37B Phạm Ngọc Thạch, Q.3, TP. HCM',
        date: '16/05/2026 | 17:49',
        position: BannerPosition.HOME_MAIN_SLIDER,
        displayOrder: 1,
        isActive: true,
        createdBy: adminUser.id,
      },
    }),
    prisma.banner.create({
      data: {
        title: 'Vinpearl Wonderworld Phú Quốc - Nghỉ dưỡng đẳng cấp',
        imageUrl: 'https://bizmall.world/st/uploads/tour/2026/04/25/69ecaf90a1522.jpeg',
        actionLink: '/tours/vinpearl-wonderworld-phu-quoc',
        location: 'Bãi Dài, Gành Dầu, Phú Quốc',
        date: 'Khởi hành hàng ngày',
        position: BannerPosition.HOME_MAIN_SLIDER,
        displayOrder: 2,
        isActive: true,
        createdBy: adminUser.id,
      },
    }),
    prisma.banner.create({
      data: {
        title: 'Vicky Nhung + Chu Thúy Quỳnh - Đêm nhạc tình ca',
        imageUrl: 'https://bizmall.world/st/uploads/show/2026/04/22/69e837898df2e.jpeg',
        actionLink: '/shows/vicky-nhung-chu-thuy-quynh',
        location: 'Sân khấu Sky Garden - Sài Gòn',
        date: '20/05/2026 | 19:30',
        position: BannerPosition.HOME_MAIN_SLIDER,
        displayOrder: 3,
        isActive: true,
        createdBy: adminUser.id,
      },
    }),
    prisma.banner.create({
      data: {
        title: 'Vinpearl Empire Nha Trang - Thiên đường biển gọi',
        imageUrl: 'https://bizmall.world/st/uploads/tour/2026/04/26/69ee1f4cc6af0.png',
        actionLink: '/tours/vinpearl-empire-nha-trang-affiliated-by-melia',
        location: 'Lê Thánh Tôn, Nha Trang, Khánh Hòa',
        date: 'Tour 3 ngày 2 đêm',
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
  // 14. SEED SINGER PACKAGES & PAYMENT METHODS
  // ============================================================================
  await seedSingerPackages();
  await seedPaymentMethods(prisma);

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

  await seedStaticPages(prisma);

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

