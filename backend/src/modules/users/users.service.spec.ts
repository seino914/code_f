import { Test, TestingModule } from '@nestjs/testing';
import {
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../../database/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: {
    user: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    company: 'Test Company',
    password: 'hashedPassword123',
    failedLoginAttempts: 0,
    lockedUntil: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get(PrismaService) as typeof prismaService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUser', () => {
    describe('正常系', () => {
      it('ユーザーが存在する場合、ユーザー情報が返されること', async () => {
        // Arrange
        prismaService.user.findUnique.mockResolvedValue(mockUser);

        // Act
        const result = await service.getUser(mockUser.id);

        // Assert
        expect(result).toEqual({
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          company: mockUser.company,
        });
        expect(prismaService.user.findUnique).toHaveBeenCalledWith({
          where: { id: mockUser.id },
        });
      });
    });

    describe('異常系', () => {
      it('ユーザーが存在しない場合、UnauthorizedExceptionがスローされること', async () => {
        // Arrange
        prismaService.user.findUnique.mockResolvedValue(null);

        // Act & Assert
        await expect(service.getUser('non-existent-id')).rejects.toThrow(
          UnauthorizedException,
        );
        await expect(service.getUser('non-existent-id')).rejects.toThrow(
          'ユーザーが見つかりません',
        );
        expect(prismaService.user.findUnique).toHaveBeenCalledWith({
          where: { id: 'non-existent-id' },
        });
      });
    });
  });

  describe('updateUser', () => {
    const updateUserDto: UpdateUserDto = {
      name: 'Updated User',
      company: 'Updated Company',
      email: 'updated@example.com',
    };

    describe('正常系', () => {
      it('有効な更新情報の場合、ユーザー情報が更新されること', async () => {
        // Arrange
        prismaService.user.findUnique
          .mockResolvedValueOnce(mockUser) // 現在のユーザー取得
          .mockResolvedValueOnce(null); // メールアドレス重複チェック（重複なし）
        const updatedUser = {
          ...mockUser,
          name: updateUserDto.name,
          company: updateUserDto.company,
          email: updateUserDto.email,
        };
        prismaService.user.update.mockResolvedValue(updatedUser);

        // Act
        const result = await service.updateUser(mockUser.id, updateUserDto);

        // Assert
        expect(result).toEqual({
          message: 'ユーザー情報を更新しました',
          user: {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            company: updatedUser.company,
          },
        });
        expect(prismaService.user.findUnique).toHaveBeenCalledTimes(2);
        expect(prismaService.user.findUnique).toHaveBeenNthCalledWith(1, {
          where: { id: mockUser.id },
        });
        expect(prismaService.user.findUnique).toHaveBeenNthCalledWith(2, {
          where: { email: updateUserDto.email },
        });
        expect(prismaService.user.update).toHaveBeenCalledWith({
          where: { id: mockUser.id },
          data: {
            name: updateUserDto.name,
            company: updateUserDto.company,
            email: updateUserDto.email,
          },
        });
      });

      it('メールアドレスが変更されない場合、重複チェックが行われないこと', async () => {
        // Arrange
        const updateDtoWithoutEmailChange: UpdateUserDto = {
          name: 'Updated User',
          company: 'Updated Company',
          email: mockUser.email, // 同じメールアドレス
        };
        prismaService.user.findUnique.mockResolvedValue(mockUser);
        const updatedUser = {
          ...mockUser,
          name: updateDtoWithoutEmailChange.name,
          company: updateDtoWithoutEmailChange.company,
        };
        prismaService.user.update.mockResolvedValue(updatedUser);

        // Act
        const result = await service.updateUser(
          mockUser.id,
          updateDtoWithoutEmailChange,
        );

        // Assert
        expect(result).toEqual({
          message: 'ユーザー情報を更新しました',
          user: {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            company: updatedUser.company,
          },
        });
        // メールアドレスが同じなので、重複チェックのfindUniqueは1回だけ（現在のユーザー取得のみ）
        expect(prismaService.user.findUnique).toHaveBeenCalledTimes(1);
        expect(prismaService.user.findUnique).toHaveBeenCalledWith({
          where: { id: mockUser.id },
        });
      });
    });

    describe('異常系', () => {
      it('ユーザーが存在しない場合、UnauthorizedExceptionがスローされること', async () => {
        // Arrange
        prismaService.user.findUnique.mockResolvedValue(null);

        // Act & Assert
        await expect(
          service.updateUser('non-existent-id', updateUserDto),
        ).rejects.toThrow(UnauthorizedException);
        await expect(
          service.updateUser('non-existent-id', updateUserDto),
        ).rejects.toThrow('ユーザーが見つかりません');
        expect(prismaService.user.update).not.toHaveBeenCalled();
      });

      it('メールアドレスが既に登録されている場合、ConflictExceptionがスローされること', async () => {
        // Arrange
        const existingUser = {
          ...mockUser,
          id: 'other-user-id',
          email: updateUserDto.email,
        };
        prismaService.user.findUnique
          .mockResolvedValueOnce(mockUser) // 現在のユーザー取得
          .mockResolvedValueOnce(existingUser); // メールアドレス重複チェック

        // Act & Assert
        const promise = service.updateUser(mockUser.id, updateUserDto);
        await expect(promise).rejects.toThrow(ConflictException);
        await expect(promise).rejects.toThrow('このメールアドレスは既に登録されています');
        
        expect(prismaService.user.findUnique).toHaveBeenCalledTimes(2);
        expect(prismaService.user.findUnique).toHaveBeenNthCalledWith(1, {
          where: { id: mockUser.id },
        });
        expect(prismaService.user.findUnique).toHaveBeenNthCalledWith(2, {
          where: { email: updateUserDto.email },
        });
        expect(prismaService.user.update).not.toHaveBeenCalled();
      });
    });
  });
});

