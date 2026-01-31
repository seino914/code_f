import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { UpdateUserDto, UpdateUserResponseDto } from '../dto/update-user.dto';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    company: 'Test Company',
  };

  const mockUserFromToken = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    company: 'Test Company',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            getUser: jest.fn(),
            updateUser: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUser', () => {
    describe('正常系', () => {
      it('ユーザーが存在する場合、ユーザー情報が返されること', async () => {
        // Arrange
        usersService.getUser.mockResolvedValue(mockUser);

        // Act
        const result = await controller.getUser(mockUserFromToken);

        // Assert
        expect(result).toEqual(mockUser);
        expect(usersService.getUser).toHaveBeenCalledWith(mockUserFromToken.id);
      });
    });

    describe('異常系', () => {
      it('ユーザーが存在しない場合、UsersServiceのエラーがそのままスローされること', async () => {
        // Arrange
        const error = new UnauthorizedException('ユーザーが見つかりません');
        usersService.getUser.mockRejectedValue(error);

        // Act & Assert
        await expect(controller.getUser(mockUserFromToken)).rejects.toThrow(
          UnauthorizedException
        );
        await expect(controller.getUser(mockUserFromToken)).rejects.toThrow(
          'ユーザーが見つかりません'
        );
      });
    });
  });

  describe('updateUser', () => {
    const updateUserDto: UpdateUserDto = {
      name: 'Updated User',
      company: 'Updated Company',
      email: 'updated@example.com',
    };

    const updateUserResponse: UpdateUserResponseDto = {
      message: 'ユーザー情報を更新しました',
      user: {
        id: mockUser.id,
        name: updateUserDto.name,
        email: updateUserDto.email,
        company: updateUserDto.company,
      },
    };

    describe('正常系', () => {
      it('有効な更新情報の場合、更新されたユーザー情報が返されること', async () => {
        // Arrange
        usersService.updateUser.mockResolvedValue(updateUserResponse);

        // Act
        const result = await controller.updateUser(
          mockUserFromToken,
          updateUserDto
        );

        // Assert
        expect(result).toEqual(updateUserResponse);
        expect(usersService.updateUser).toHaveBeenCalledWith(
          mockUserFromToken.id,
          updateUserDto
        );
      });
    });

    describe('異常系', () => {
      it('ユーザーが存在しない場合、UsersServiceのエラーがそのままスローされること', async () => {
        // Arrange
        const error = new UnauthorizedException('ユーザーが見つかりません');
        usersService.updateUser.mockRejectedValue(error);

        // Act & Assert
        await expect(
          controller.updateUser(mockUserFromToken, updateUserDto)
        ).rejects.toThrow(UnauthorizedException);
        await expect(
          controller.updateUser(mockUserFromToken, updateUserDto)
        ).rejects.toThrow('ユーザーが見つかりません');
      });

      it('メールアドレスが既に登録されている場合、UsersServiceのエラーがそのままスローされること', async () => {
        // Arrange
        const error = new ConflictException(
          'このメールアドレスは既に登録されています'
        );
        usersService.updateUser.mockRejectedValue(error);

        // Act & Assert
        await expect(
          controller.updateUser(mockUserFromToken, updateUserDto)
        ).rejects.toThrow(ConflictException);
        await expect(
          controller.updateUser(mockUserFromToken, updateUserDto)
        ).rejects.toThrow('このメールアドレスは既に登録されています');
      });
    });
  });
});
