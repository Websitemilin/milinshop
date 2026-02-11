import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@luxe/types';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: jest.Mocked<PrismaService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    password: 'hashed_password',
    firstName: 'John',
    lastName: 'Doe',
    role: UserRole.USER,
    isActive: true,
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRegisterDto = {
    email: 'newuser@example.com',
    password: 'password123',
    firstName: 'Jane',
    lastName: 'Smith',
  };

  const mockLoginDto = {
    email: 'test@example.com',
    password: 'password123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            refreshToken: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get(PrismaService) as jest.Mocked<PrismaService>;
    jwtService = module.get(JwtService) as jest.Mocked<JwtService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const hashedPassword = 'hashed_new_password';
      const accessToken = 'access_token';
      const refreshToken = 'refresh_token';

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaService.user.create as jest.Mock).mockResolvedValue({
        ...mockUser,
        email: mockRegisterDto.email,
        firstName: mockRegisterDto.firstName,
        lastName: mockRegisterDto.lastName,
      });
      (jwtService.sign as jest.Mock)
        .mockReturnValueOnce(accessToken)
        .mockReturnValueOnce(refreshToken);
      (prismaService.refreshToken.create as jest.Mock).mockResolvedValue({
        token: refreshToken,
      });

      const result = await service.register(mockRegisterDto);

      expect(result).toHaveProperty('accessToken', accessToken);
      expect(result).toHaveProperty('refreshToken', refreshToken);
      expect(result.user.email).toBe(mockRegisterDto.email);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: mockRegisterDto.email,
          password: hashedPassword,
          firstName: mockRegisterDto.firstName,
          lastName: mockRegisterDto.lastName,
          role: UserRole.USER,
          profile: { create: {} },
          cart: { create: {} },
        },
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await expect(service.register(mockRegisterDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const accessToken = 'access_token';
      const refreshToken = 'refresh_token';

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwtService.sign as jest.Mock)
        .mockReturnValueOnce(accessToken)
        .mockReturnValueOnce(refreshToken);
      (prismaService.refreshToken.create as jest.Mock).mockResolvedValue({
        token: refreshToken,
      });

      const result = await service.login(mockLoginDto);

      expect(result).toHaveProperty('accessToken', accessToken);
      expect(result).toHaveProperty('refreshToken', refreshToken);
      expect(result.user.email).toBe(mockUser.email);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { lastLoginAt: expect.any(Date) },
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.login(mockLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(mockLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if account is inactive', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(
        inactiveUser,
      );
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.login(mockLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const oldRefreshToken = 'old_refresh_token';
      const newAccessToken = 'new_access_token';
      const newRefreshToken = 'new_refresh_token';
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      (prismaService.refreshToken.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        token: oldRefreshToken,
        userId: mockUser.id,
        expiresAt,
        revokedAt: null,
        user: mockUser,
      });
      (jwtService.sign as jest.Mock)
        .mockReturnValueOnce(newAccessToken)
        .mockReturnValueOnce(newRefreshToken);
      (prismaService.refreshToken.update as jest.Mock).mockResolvedValue({});
      (prismaService.refreshToken.create as jest.Mock).mockResolvedValue({});

      const result = await service.refreshToken(mockUser.id, oldRefreshToken);

      expect(result).toHaveProperty('accessToken', newAccessToken);
      expect(result).toHaveProperty('refreshToken', newRefreshToken);
      expect(prismaService.refreshToken.update).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if refresh token not found', async () => {
      (prismaService.refreshToken.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(
        service.refreshToken(mockUser.id, 'invalid_token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if refresh token expired', async () => {
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 1);

      (prismaService.refreshToken.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        token: 'expired_token',
        userId: mockUser.id,
        expiresAt: expiredDate,
        revokedAt: null,
        user: mockUser,
      });

      await expect(
        service.refreshToken(mockUser.id, 'expired_token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
