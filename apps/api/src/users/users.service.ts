import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './users.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const updateData: any = {};

    if (dto.firstName) updateData.firstName = dto.firstName;
    if (dto.lastName) updateData.lastName = dto.lastName;
    if (dto.phone) updateData.phone = dto.phone;

    const profileData: any = {};
    if (dto.address) profileData.address = dto.address;
    if (dto.city) profileData.city = dto.city;
    if (dto.country) profileData.country = dto.country;
    if (dto.zipCode) profileData.zipCode = dto.zipCode;
    if (dto.bio) profileData.bio = dto.bio;

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...updateData,
        profile: {
          update: profileData,
        },
      },
      include: { profile: true },
    });

    return user;
  }

  async getAllUsers(skip: number = 0, take: number = 20) {
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take,
        include: { profile: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      items: users,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
      totalPages: Math.ceil(total / take),
    };
  }
}
