import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}
  async findAll() {
    return this.prisma.branch.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }
  async findOne(id: number) {
    const branch = await this.prisma.branch.findFirst({
      where: { id, deletedAt: null },
    });
    if (!branch) {
      throw new NotFoundException({
        code: 'BRANCH_001',
        message: 'Không tìm thấy chi nhánh.',
      });
    }
    return branch;
  }
  async create(createBranchDto: CreateBranchDto) {
    return this.prisma.branch.create({
      data: {
        name: createBranchDto.name,
        description: createBranchDto.description,
      },
    });
  }
  async update(id: number, updateBranchDto: UpdateBranchDto) {
    await this.findOne(id);
    return this.prisma.branch.update({
      where: { id },
      data: updateBranchDto,
    });
  }
  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.branch.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { message: 'Đã xóa chi nhánh thành công.' };
  }
}
