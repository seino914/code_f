import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersUsecase } from '../usecase/users.usecase';
import { UsersRepository } from '../repository/users.repository';
import { UpdateUserDto } from '../dto/update-user.dto';

describe('UsersUsecase', () => {
  let usecase: UsersUsecase;
  let repository: jest.Mocked<UsersRepository>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    company: 'Test Company',
    password: 'hashedPassword123',
    role: null,
    failedLoginAttempts: 0,
    lockedUntil: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersUsecase,
        {
          provide: UsersRepository,
          useValue: {
            findById: jest.fn(),
            findByEmail: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    usecase = module.get<UsersUsecase>(UsersUsecase);
    repository = module.get(UsersRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUser', () => {
    describe('正常系', () => {
      it('ユーザーが存在する場合、ユーザー情報が返されること', async () => {
        // Arrange
        const userResponse = {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          company: mockUser.company,
        };
        repository.findById.mockResolvedValue(mockUser);

        // Act
        const result = await usecase.getUser(mockUser.id);

        // Assert
        expect(result).toEqual(userResponse);
        expect(repository.findById).toHaveBeenCalledWith(mockUser.id);
      });
    });

    describe('異常系', () => {
      it('ユーザーが存在しない場合、UnauthorizedExceptionがスローされること', async () => {
        // Arrange
        repository.findById.mockResolvedValue(null);

        // Act & Assert
        await expect(usecase.getUser('non-existent-id')).rejects.toThrow(
          UnauthorizedException
        );
        await expect(usecase.getUser('non-existent-id')).rejects.toThrow(
          'ユーザーが見つかりません'
        );
        expect(repository.findById).toHaveBeenCalledWith('non-existent-id');
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
        const updatedUser = {
          ...mockUser,
          name: updateUserDto.name,
          company: updateUserDto.company,
          email: updateUserDto.email,
        };
        const userResponse = {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          company: updatedUser.company,
        };
        repository.findById.mockResolvedValue(mockUser);
        repository.findByEmail.mockResolvedValue(null); // メールアドレス重複チェック（重複なし）
        repository.update.mockResolvedValue(updatedUser);

        // Act
        const result = await usecase.updateUser(mockUser.id, updateUserDto);

        // Assert
        expect(result).toEqual({
          message: 'ユーザー情報を更新しました',
          user: userResponse,
        });
        expect(repository.findById).toHaveBeenCalledWith(mockUser.id);
        expect(repository.findByEmail).toHaveBeenCalledWith(
          updateUserDto.email
        );
        expect(repository.update).toHaveBeenCalledWith(mockUser.id, {
          name: updateUserDto.name,
          company: updateUserDto.company,
          email: updateUserDto.email,
        });
      });

      it('メールアドレスが変更されない場合、重複チェックが行われないこと', async () => {
        // Arrange
        const updateDtoWithoutEmailChange: UpdateUserDto = {
          name: 'Updated User',
          company: 'Updated Company',
          email: mockUser.email, // 同じメールアドレス
        };
        const updatedUser = {
          ...mockUser,
          name: updateDtoWithoutEmailChange.name,
          company: updateDtoWithoutEmailChange.company,
        };
        const userResponse = {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          company: updatedUser.company,
        };
        repository.findById.mockResolvedValue(mockUser);
        repository.update.mockResolvedValue(updatedUser);

        // Act
        const result = await usecase.updateUser(
          mockUser.id,
          updateDtoWithoutEmailChange
        );

        // Assert
        expect(result).toEqual({
          message: 'ユーザー情報を更新しました',
          user: userResponse,
        });
        // メールアドレスが同じなので、重複チェックのfindByEmailは呼ばれない
        expect(repository.findByEmail).not.toHaveBeenCalled();
        expect(repository.findById).toHaveBeenCalledWith(mockUser.id);
        expect(repository.update).toHaveBeenCalledWith(mockUser.id, {
          name: updateDtoWithoutEmailChange.name,
          company: updateDtoWithoutEmailChange.company,
          email: updateDtoWithoutEmailChange.email,
        });
      });
    });

    describe('異常系', () => {
      it('ユーザーが存在しない場合、UnauthorizedExceptionがスローされること', async () => {
        // Arrange
        repository.findById.mockResolvedValue(null);

        // Act & Assert
        await expect(
          usecase.updateUser('non-existent-id', updateUserDto)
        ).rejects.toThrow(UnauthorizedException);
        await expect(
          usecase.updateUser('non-existent-id', updateUserDto)
        ).rejects.toThrow('ユーザーが見つかりません');
        expect(repository.update).not.toHaveBeenCalled();
      });

      it('メールアドレスが既に登録されている場合、ConflictExceptionがスローされること', async () => {
        // Arrange
        const existingUser = {
          ...mockUser,
          id: 'other-user-id',
          email: updateUserDto.email,
        };
        repository.findById.mockResolvedValue(mockUser);
        repository.findByEmail.mockResolvedValue(existingUser); // メールアドレス重複チェック

        // Act & Assert
        const promise = usecase.updateUser(mockUser.id, updateUserDto);
        await expect(promise).rejects.toThrow(ConflictException);
        await expect(promise).rejects.toThrow(
          'このメールアドレスは既に登録されています'
        );

        expect(repository.findById).toHaveBeenCalledWith(mockUser.id);
        expect(repository.findByEmail).toHaveBeenCalledWith(
          updateUserDto.email
        );
        expect(repository.update).not.toHaveBeenCalled();
      });
    });
  });
});

