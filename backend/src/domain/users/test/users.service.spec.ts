import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users.service';
import { UsersUsecase } from '../usecase/users.usecase';
import { UpdateUserDto } from '../dto/update-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let usecase: jest.Mocked<UsersUsecase>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    company: 'Test Company',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersUsecase,
          useValue: {
            getUser: jest.fn(),
            updateUser: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usecase = module.get(UsersUsecase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUser', () => {
    describe('正常系', () => {
      it('ユーザーが存在する場合、ユーザー情報が返されること', async () => {
        // Arrange
        usecase.getUser.mockResolvedValue(mockUser);

        // Act
        const result = await service.getUser(mockUser.id);

        // Assert
        expect(result).toEqual(mockUser);
        expect(usecase.getUser).toHaveBeenCalledWith(mockUser.id);
      });
    });

    describe('異常系', () => {
      it('ユーザーが存在しない場合、UseCaseのエラーがそのままスローされること', async () => {
        // Arrange
        const error = new UnauthorizedException('ユーザーが見つかりません');
        usecase.getUser.mockRejectedValue(error);

        // Act & Assert
        await expect(service.getUser('non-existent-id')).rejects.toThrow(
          UnauthorizedException
        );
        await expect(service.getUser('non-existent-id')).rejects.toThrow(
          'ユーザーが見つかりません'
        );
        expect(usecase.getUser).toHaveBeenCalledWith('non-existent-id');
      });
    });
  });

  describe('updateUser', () => {
    const updateUserDto: UpdateUserDto = {
      name: 'Updated User',
      company: 'Updated Company',
      email: 'updated@example.com',
    };

    const updateUserResponse = {
      message: 'ユーザー情報を更新しました',
      user: {
        id: mockUser.id,
        name: updateUserDto.name,
        email: updateUserDto.email,
        company: updateUserDto.company,
      },
    };

    describe('正常系', () => {
      it('有効な更新情報の場合、ユーザー情報が更新されること', async () => {
        // Arrange
        usecase.updateUser.mockResolvedValue(updateUserResponse);

        // Act
        const result = await service.updateUser(mockUser.id, updateUserDto);

        // Assert
        expect(result).toEqual(updateUserResponse);
        expect(usecase.updateUser).toHaveBeenCalledWith(
          mockUser.id,
          updateUserDto
        );
      });
    });

    describe('異常系', () => {
      it('ユーザーが存在しない場合、UseCaseのエラーがそのままスローされること', async () => {
        // Arrange
        const error = new UnauthorizedException('ユーザーが見つかりません');
        usecase.updateUser.mockRejectedValue(error);

        // Act & Assert
        await expect(
          service.updateUser('non-existent-id', updateUserDto)
        ).rejects.toThrow(UnauthorizedException);
        await expect(
          service.updateUser('non-existent-id', updateUserDto)
        ).rejects.toThrow('ユーザーが見つかりません');
        expect(usecase.updateUser).toHaveBeenCalledWith(
          'non-existent-id',
          updateUserDto
        );
      });

      it('メールアドレスが既に登録されている場合、UseCaseのエラーがそのままスローされること', async () => {
        // Arrange
        const error = new ConflictException(
          'このメールアドレスは既に登録されています'
        );
        usecase.updateUser.mockRejectedValue(error);

        // Act & Assert
        await expect(
          service.updateUser(mockUser.id, updateUserDto)
        ).rejects.toThrow(ConflictException);
        await expect(
          service.updateUser(mockUser.id, updateUserDto)
        ).rejects.toThrow('このメールアドレスは既に登録されています');
        expect(usecase.updateUser).toHaveBeenCalledWith(
          mockUser.id,
          updateUserDto
        );
      });
    });
  });
});

