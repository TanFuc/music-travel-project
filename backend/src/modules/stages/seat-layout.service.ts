import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CacheService } from '@/cache/cache.service';
import {
    CreateSeatLayoutDto,
    SeatLayoutTemplate,
    ZoneConfigDto,
    CreateCustomSeatsDto,
    BulkUpdateSeatsDto,
} from './dto/create-seat-layout.dto';
import { SeatType } from '@prisma/client';

interface SeatPosition {
    zoneName: string;
    rowName: string;
    seatNumber: string;
    type: SeatType;
    xPosition: number;
    yPosition: number;
}

@Injectable()
export class SeatLayoutService {
    private readonly DEFAULT_SEAT_SPACING = 40;
    private readonly DEFAULT_ROW_SPACING = 45;
    private readonly DEFAULT_STAGE_DISTANCE = 100;

    constructor(
        private readonly prisma: PrismaService,
        private readonly cache: CacheService,
    ) { }

    /**
     * Generate seats based on template
     */
    async generateFromTemplate(dto: CreateSeatLayoutDto) {
        const stage = await this.prisma.stage.findUnique({
            where: { id: dto.stageId },
        });

        if (!stage) {
            throw new NotFoundException('Sân khấu không tồn tại');
        }

        // Clear existing seats for this stage
        await this.prisma.physicalSeat.deleteMany({
            where: { stageId: dto.stageId },
        });

        const seatSpacing = dto.seatSpacing ?? this.DEFAULT_SEAT_SPACING;
        const rowSpacing = dto.rowSpacing ?? this.DEFAULT_ROW_SPACING;
        const stageDistance = dto.stageDistance ?? this.DEFAULT_STAGE_DISTANCE;

        let allSeats: SeatPosition[] = [];

        switch (dto.template) {
            case SeatLayoutTemplate.THEATER_STANDARD:
                allSeats = this.generateTheaterLayout(dto.zones, seatSpacing, rowSpacing, stageDistance);
                break;
            case SeatLayoutTemplate.STADIUM:
                allSeats = this.generateStadiumLayout(dto.zones, seatSpacing, rowSpacing, stageDistance);
                break;
            case SeatLayoutTemplate.CONCERT_HALL:
                allSeats = this.generateConcertHallLayout(dto.zones, seatSpacing, rowSpacing, stageDistance);
                break;
            case SeatLayoutTemplate.STANDING_ONLY:
                allSeats = this.generateStandingLayout(dto.zones, seatSpacing, rowSpacing, stageDistance);
                break;
            case SeatLayoutTemplate.MIXED:
                allSeats = this.generateMixedLayout(dto.zones, seatSpacing, rowSpacing, stageDistance);
                break;
            default:
                throw new BadRequestException('Template không được hỗ trợ');
        }

        // Bulk create seats
        const createdSeats = await this.prisma.physicalSeat.createMany({
            data: allSeats.map((seat) => ({
                stageId: dto.stageId,
                zoneName: seat.zoneName,
                rowName: seat.rowName,
                seatNumber: seat.seatNumber,
                type: seat.type,
                xPosition: seat.xPosition,
                yPosition: seat.yPosition,
            })),
        });

        // Clear cache
        await this.cache.del(`stage:${dto.stageId}:seats`);

        return {
            message: `Đã tạo ${createdSeats.count} ghế thành công`,
            count: createdSeats.count,
            stageId: dto.stageId,
        };
    }

    /**
     * Theater Layout - ghế xếp hàng ngang
     */
    private generateTheaterLayout(
        zones: ZoneConfigDto[],
        seatSpacing: number,
        rowSpacing: number,
        stageDistance: number,
    ): SeatPosition[] {
        const seats: SeatPosition[] = [];
        let currentY = stageDistance;

        for (const zone of zones) {
            const offsetX = zone.offsetX ?? 0;
            const offsetY = zone.offsetY ?? 0;

            for (let row = 0; row < zone.rows; row++) {
                const rowName = String.fromCharCode(65 + row); // A, B, C, ...
                const rowWidth = (zone.seatsPerRow - 1) * seatSpacing;
                const startX = -rowWidth / 2 + offsetX;

                for (let seat = 0; seat < zone.seatsPerRow; seat++) {
                    seats.push({
                        zoneName: zone.name,
                        rowName: rowName,
                        seatNumber: String(seat + 1),
                        type: zone.type === 'STANDING' ? SeatType.STANDING : SeatType.SEAT,
                        xPosition: Math.round(startX + seat * seatSpacing + 500), // Center at 500
                        yPosition: Math.round(currentY + row * rowSpacing + offsetY),
                    });
                }
            }
            currentY += zone.rows * rowSpacing + 50; // Gap between zones
        }

        return seats;
    }

    /**
     * Stadium Layout - ghế xếp vòng cung
     */
    private generateStadiumLayout(
        zones: ZoneConfigDto[],
        seatSpacing: number,
        rowSpacing: number,
        stageDistance: number,
    ): SeatPosition[] {
        const seats: SeatPosition[] = [];
        const centerX = 500;
        let baseRadius = stageDistance;

        for (const zone of zones) {
            const curvature = (zone.curvature ?? 30) / 100; // 0-1 range
            const maxAngle = Math.PI * curvature; // Max arc angle

            for (let row = 0; row < zone.rows; row++) {
                const rowName = String.fromCharCode(65 + row);
                const radius = baseRadius + row * rowSpacing;

                for (let seat = 0; seat < zone.seatsPerRow; seat++) {
                    // Calculate angle for this seat
                    const angleStep = maxAngle / (zone.seatsPerRow - 1 || 1);
                    const angle = -maxAngle / 2 + seat * angleStep;

                    const x = centerX + radius * Math.sin(angle);
                    const y = radius * Math.cos(angle);

                    seats.push({
                        zoneName: zone.name,
                        rowName: rowName,
                        seatNumber: String(seat + 1),
                        type: zone.type === 'STANDING' ? SeatType.STANDING : SeatType.SEAT,
                        xPosition: Math.round(x),
                        yPosition: Math.round(y),
                    });
                }
            }
            baseRadius += zone.rows * rowSpacing + 60;
        }

        return seats;
    }

    /**
     * Concert Hall Layout - hình quạt
     */
    private generateConcertHallLayout(
        zones: ZoneConfigDto[],
        seatSpacing: number,
        rowSpacing: number,
        stageDistance: number,
    ): SeatPosition[] {
        const seats: SeatPosition[] = [];
        const centerX = 500;
        let currentY = stageDistance;

        for (const zone of zones) {
            for (let row = 0; row < zone.rows; row++) {
                const rowName = String.fromCharCode(65 + row);
                // Each row gets progressively wider (fan shape)
                const widthMultiplier = 1 + row * 0.1;
                const actualSeatsPerRow = Math.round(zone.seatsPerRow * widthMultiplier);
                const actualSpacing = seatSpacing * widthMultiplier;
                const rowWidth = (actualSeatsPerRow - 1) * actualSpacing;
                const startX = centerX - rowWidth / 2;

                for (let seat = 0; seat < actualSeatsPerRow; seat++) {
                    seats.push({
                        zoneName: zone.name,
                        rowName: rowName,
                        seatNumber: String(seat + 1),
                        type: zone.type === 'STANDING' ? SeatType.STANDING : SeatType.SEAT,
                        xPosition: Math.round(startX + seat * actualSpacing),
                        yPosition: Math.round(currentY + row * rowSpacing),
                    });
                }
            }
            currentY += zone.rows * rowSpacing + 50;
        }

        return seats;
    }

    /**
     * Standing Layout - khu vực đứng
     */
    private generateStandingLayout(
        zones: ZoneConfigDto[],
        seatSpacing: number,
        _rowSpacing: number,
        stageDistance: number,
    ): SeatPosition[] {
        const seats: SeatPosition[] = [];
        const centerX = 500;
        let currentY = stageDistance;

        for (const zone of zones) {
            const gridSpacing = seatSpacing * 0.7; // Standing areas can be denser
            const totalWidth = (zone.seatsPerRow - 1) * gridSpacing;
            const startX = centerX - totalWidth / 2;

            for (let row = 0; row < zone.rows; row++) {
                for (let col = 0; col < zone.seatsPerRow; col++) {
                    seats.push({
                        zoneName: zone.name,
                        rowName: `S${row + 1}`,
                        seatNumber: String(col + 1),
                        type: SeatType.STANDING,
                        xPosition: Math.round(startX + col * gridSpacing),
                        yPosition: Math.round(currentY + row * gridSpacing),
                    });
                }
            }
            currentY += zone.rows * gridSpacing + 40;
        }

        return seats;
    }

    /**
     * Mixed Layout - kết hợp ngồi và đứng
     */
    private generateMixedLayout(
        zones: ZoneConfigDto[],
        seatSpacing: number,
        rowSpacing: number,
        stageDistance: number,
    ): SeatPosition[] {
        const seats: SeatPosition[] = [];

        for (const zone of zones) {
            if (zone.type === 'STANDING') {
                seats.push(
                    ...this.generateStandingLayout([zone], seatSpacing, rowSpacing, stageDistance + (zone.offsetY ?? 0)),
                );
            } else {
                seats.push(
                    ...this.generateTheaterLayout([zone], seatSpacing, rowSpacing, stageDistance + (zone.offsetY ?? 0)),
                );
            }
        }

        return seats;
    }

    /**
     * Create custom seats manually
     */
    async createCustomSeats(dto: CreateCustomSeatsDto) {
        const stage = await this.prisma.stage.findUnique({
            where: { id: dto.stageId },
        });

        if (!stage) {
            throw new NotFoundException('Sân khấu không tồn tại');
        }

        const createdSeats = await this.prisma.physicalSeat.createMany({
            data: dto.seats.map((seat) => ({
                stageId: dto.stageId,
                zoneName: seat.zoneName,
                rowName: seat.rowName,
                seatNumber: seat.seatNumber,
                type: seat.type,
                xPosition: seat.xPosition,
                yPosition: seat.yPosition,
            })),
        });

        await this.cache.del(`stage:${dto.stageId}:seats`);

        return {
            message: `Đã tạo ${createdSeats.count} ghế thành công`,
            count: createdSeats.count,
        };
    }

    /**
     * Update seat positions (drag & drop)
     */
    async updateSeatPositions(dto: BulkUpdateSeatsDto) {
        const updates = dto.seats.map((seat) =>
            this.prisma.physicalSeat.update({
                where: { id: seat.seatId },
                data: {
                    xPosition: seat.xPosition,
                    yPosition: seat.yPosition,
                },
            }),
        );

        await this.prisma.$transaction(updates);

        return { message: `Đã cập nhật vị trí ${dto.seats.length} ghế` };
    }

    /**
     * Get all seats for a stage
     */
    async getStageSeatLayout(stageId: number) {
        const cacheKey = `stage:${stageId}:seats`;
        const cached = await this.cache.get(cacheKey);
        if (cached) return cached;

        const seats = await this.prisma.physicalSeat.findMany({
            where: { stageId },
            orderBy: [{ zoneName: 'asc' }, { rowName: 'asc' }, { seatNumber: 'asc' }],
        });

        const stage = await this.prisma.stage.findUnique({
            where: { id: stageId },
            select: { id: true, name: true, address: true },
        });

        // Group by zone
        const zoneMap = new Map<string, typeof seats>();
        seats.forEach((seat) => {
            const zone = seat.zoneName || 'Chung';
            if (!zoneMap.has(zone)) {
                zoneMap.set(zone, []);
            }
            zoneMap.get(zone)!.push(seat);
        });

        const result = {
            stage,
            totalSeats: seats.length,
            zones: Array.from(zoneMap.entries()).map(([name, zoneSeats]) => ({
                name,
                seatCount: zoneSeats.length,
                seats: zoneSeats,
            })),
            allSeats: seats,
        };

        await this.cache.set(cacheKey, result, 300);

        return result;
    }

    /**
     * Delete all seats for a stage
     */
    async clearStageSeats(stageId: number) {
        const result = await this.prisma.physicalSeat.deleteMany({
            where: { stageId },
        });

        await this.cache.del(`stage:${stageId}:seats`);

        return {
            message: `Đã xóa ${result.count} ghế`,
            count: result.count,
        };
    }

    /**
     * Get available templates with descriptions
     */
    getTemplates() {
        return [
            {
                id: SeatLayoutTemplate.THEATER_STANDARD,
                name: 'Nhà hát tiêu chuẩn',
                description: 'Ghế xếp hàng ngang, phù hợp cho nhà hát, rạp chiếu phim',
                icon: '🎭',
                example: {
                    zones: [
                        { name: 'VIP', rows: 3, seatsPerRow: 12 },
                        { name: 'Thường', rows: 5, seatsPerRow: 15 },
                    ],
                },
            },
            {
                id: SeatLayoutTemplate.STADIUM,
                name: 'Sân vận động',
                description: 'Ghế xếp vòng cung, phù hợp cho concert lớn, sân vận động',
                icon: '🏟️',
                example: {
                    zones: [
                        { name: 'VIP', rows: 3, seatsPerRow: 20, curvature: 40 },
                        { name: 'Thường', rows: 6, seatsPerRow: 25, curvature: 50 },
                    ],
                },
            },
            {
                id: SeatLayoutTemplate.CONCERT_HALL,
                name: 'Phòng hòa nhạc',
                description: 'Hình quạt mở rộng dần, phù hợp cho hội trường, phòng hòa nhạc',
                icon: '🎵',
                example: {
                    zones: [
                        { name: 'Hạng A', rows: 4, seatsPerRow: 10 },
                        { name: 'Hạng B', rows: 6, seatsPerRow: 12 },
                    ],
                },
            },
            {
                id: SeatLayoutTemplate.STANDING_ONLY,
                name: 'Khu vực đứng',
                description: 'Chỉ có khu đứng, phù hợp cho show EDM, rock concert',
                icon: '🎤',
                example: {
                    zones: [{ name: 'GA', rows: 10, seatsPerRow: 20, type: 'STANDING' }],
                },
            },
            {
                id: SeatLayoutTemplate.MIXED,
                name: 'Hỗn hợp',
                description: 'Kết hợp khu ngồi VIP và khu đứng ga, linh hoạt',
                icon: '🎪',
                example: {
                    zones: [
                        { name: 'VIP', rows: 3, seatsPerRow: 15, type: 'SEAT' },
                        { name: 'GA', rows: 8, seatsPerRow: 20, type: 'STANDING', offsetY: 200 },
                    ],
                },
            },
        ];
    }
}
