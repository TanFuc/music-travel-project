import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ComplaintStatus, Prisma } from '@prisma/client';

export interface CreateQuestionDto {
  question: string;
  answer: string;
  category: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateQuestionDto {
  question?: string;
  answer?: string;
  category?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface CreateComplaintDto {
  content: string;
  orderId?: number;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
}

export interface ReplyComplaintDto {
  adminReply: string;
  status?: ComplaintStatus;
}

@Injectable()
export class SmartSupportService {
  constructor(private readonly prisma: PrismaService) {}

  // ================ FAQ / Support Questions ================

  async createQuestion(dto: CreateQuestionDto, createdBy: number) {
    return this.prisma.supportQuestion.create({
      data: {
        question: dto.question,
        answer: dto.answer,
        category: dto.category,
        displayOrder: dto.displayOrder || 0,
        isActive: dto.isActive ?? true,
        createdBy,
      },
    });
  }

  async updateQuestion(id: number, dto: UpdateQuestionDto, updatedBy: number) {
    const question = await this.prisma.supportQuestion.findUnique({
      where: { id },
    });

    if (!question) {
      throw new NotFoundException('Câu hỏi không tồn tại');
    }

    return this.prisma.supportQuestion.update({
      where: { id },
      data: {
        question: dto.question,
        answer: dto.answer,
        category: dto.category,
        displayOrder: dto.displayOrder,
        isActive: dto.isActive,
        updatedBy,
      },
    });
  }

  async deleteQuestion(id: number) {
    const question = await this.prisma.supportQuestion.findUnique({
      where: { id },
    });

    if (!question) {
      throw new NotFoundException('Câu hỏi không tồn tại');
    }

    return this.prisma.supportQuestion.delete({
      where: { id },
    });
  }

  async getQuestionById(id: number) {
    const question = await this.prisma.supportQuestion.findUnique({
      where: { id },
    });

    if (!question) {
      throw new NotFoundException('Câu hỏi không tồn tại');
    }

    return question;
  }

  // Public: Get all active FAQs grouped by category
  async getPublicFAQs() {
    const questions = await this.prisma.supportQuestion.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { displayOrder: 'asc' }],
    });

    // Group by category
    const grouped: Record<string, typeof questions> = {};
    for (const q of questions) {
      if (!grouped[q.category]) {
        grouped[q.category] = [];
      }
      grouped[q.category].push(q);
    }

    return grouped;
  }

  // Admin: Get all FAQs with pagination
  async getAllQuestions(options: { page?: number; limit?: number; category?: string; isActive?: boolean }) {
    const { page = 1, limit = 20, category, isActive } = options;

    const where: Prisma.SupportQuestionWhereInput = {};
    if (category) where.category = category;
    if (isActive !== undefined) where.isActive = isActive;

    const [data, total] = await Promise.all([
      this.prisma.supportQuestion.findMany({
        where,
        orderBy: [{ category: 'asc' }, { displayOrder: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.supportQuestion.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get distinct categories
  async getCategories() {
    const result = await this.prisma.supportQuestion.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });
    return result.map((r) => r.category);
  }

  // ================ Complaints ================

  async createComplaint(dto: CreateComplaintDto, userId?: number) {
    // Validate: either userId or guest info must be provided
    if (!userId && !dto.guestEmail && !dto.guestPhone) {
      throw new BadRequestException('Vui lòng cung cấp email hoặc số điện thoại');
    }

    return this.prisma.complaint.create({
      data: {
        content: dto.content,
        orderId: dto.orderId,
        userId,
        guestName: dto.guestName,
        guestEmail: dto.guestEmail,
        guestPhone: dto.guestPhone,
        status: 'NEW',
      },
    });
  }

  async getComplaintById(id: number) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
            email: true,
          },
        },
      },
    });

    if (!complaint) {
      throw new NotFoundException('Khiếu nại không tồn tại');
    }

    return complaint;
  }

  // Get user's complaints
  async getMyComplaints(userId: number, options: { page?: number; limit?: number }) {
    const { page = 1, limit = 10 } = options;

    const where: Prisma.ComplaintWhereInput = { userId };

    const [data, total] = await Promise.all([
      this.prisma.complaint.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.complaint.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Admin: Get all complaints with filters
  async getAllComplaints(options: {
    page?: number;
    limit?: number;
    status?: ComplaintStatus;
    search?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const { page = 1, limit = 20, status, search, startDate, endDate } = options;

    const where: Prisma.ComplaintWhereInput = {};

    if (status) where.status = status;
    if (search) {
      where.OR = [
        { content: { contains: search, mode: 'insensitive' } },
        { guestEmail: { contains: search, mode: 'insensitive' } },
        { guestPhone: { contains: search } },
        { user: { fullName: { contains: search, mode: 'insensitive' } } },
        { user: { phoneNumber: { contains: search } } },
      ];
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [data, total] = await Promise.all([
      this.prisma.complaint.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              phoneNumber: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.complaint.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Admin: Reply to complaint
  async replyToComplaint(id: number, dto: ReplyComplaintDto, repliedBy: number) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id },
    });

    if (!complaint) {
      throw new NotFoundException('Khiếu nại không tồn tại');
    }

    return this.prisma.complaint.update({
      where: { id },
      data: {
        adminReply: dto.adminReply,
        status: dto.status || 'RESOLVED',
        repliedBy,
        repliedAt: new Date(),
      },
    });
  }

  // Admin: Update complaint status
  async updateComplaintStatus(id: number, status: ComplaintStatus) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id },
    });

    if (!complaint) {
      throw new NotFoundException('Khiếu nại không tồn tại');
    }

    return this.prisma.complaint.update({
      where: { id },
      data: { status },
    });
  }

  // Get complaint statistics
  async getComplaintStats() {
    const [total, newCount, processingCount, resolvedCount] = await Promise.all([
      this.prisma.complaint.count(),
      this.prisma.complaint.count({ where: { status: 'NEW' } }),
      this.prisma.complaint.count({ where: { status: 'PROCESSING' } }),
      this.prisma.complaint.count({ where: { status: 'RESOLVED' } }),
    ]);

    return {
      total,
      new: newCount,
      processing: processingCount,
      resolved: resolvedCount,
    };
  }
}
