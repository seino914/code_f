import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersUsecase } from '../usecase/users.usecase';
import { UsersRepository } from '../repository/users.repository';
import {
  mockUserEntity,
  mockUserResponse,
  mockUpdateUserDto,
  mockUpdatedUserEntity,
  mockUpdatedUserResponse,
  mockOtherUserEntity,
} from './mocks/users.mock';

describe('UsersUsecase', () => {
  let usecase: UsersUsecase;
  let repository: jest.Mocked<UsersRepository>;

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
        repository.findById.mockResolvedValue(mockUserEntity);

        // Act
        const result = await usecase.getUser(mockUserEntity.id);

        // Assert
        expect(result).toEqual(mockUserResponse);
        expect(repository.findById).toHaveBeenCalledWith(mockUserEntity.id);
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
        expect(repository.findById).toHaveBeenCalledWith('non-existent-id');
      });
    });
  });

  describe('updateUser', () => {
    describe('正常系', () => {
      it('有効な更新情報の場合、ユーザー情報が更新されること', async () => {
        // Arrange
        repository.findById.mockResolvedValue(mockUserEntity);
        repository.findByEmail.mockResolvedValue(null);
        repository.update.mockResolvedValue(mockUpdatedUserEntity);

        // Act
        const result = await usecase.updateUser(
          mockUserEntity.id,
          mockUpdateUserDto
        );

        // Assert
        expect(result.message).toBe('ユーザー情報を更新しました');
        expect(result.user).toEqual(mockUpdatedUserResponse);
        expect(repository.findById).toHaveBeenCalledWith(mockUserEntity.id);
        expect(repository.findByEmail).toHaveBeenCalledWith(
          mockUpdateUserDto.email
        );
        expect(repository.update).toHaveBeenCalledWith(mockUserEntity.id, {
          name: mockUpdateUserDto.name,
          company: mockUpdateUserDto.company,
          email: mockUpdateUserDto.email,
        });
      });

      it('メールアドレスが変更されない場合、重複チェックが行われないこと', async () => {
        // Arrange
        const updateDtoWithoutEmailChange = {
          ...mockUpdateUserDto,
          email: mockUserEntity.email,
        };
        repository.findById.mockResolvedValue(mockUserEntity);
        repository.update.mockResolvedValue({
          ...mockUserEntity,
          ...updateDtoWithoutEmailChange,
        });

        // Act
        await usecase.updateUser(
          mockUserEntity.id,
          updateDtoWithoutEmailChange
        );

        // Assert
        expect(repository.findByEmail).not.toHaveBeenCalled();
      });
    });

    describe('異常系', () => {
      it('ユーザーが存在しない場合、UnauthorizedExceptionがスローされること', async () => {
        // Arrange
        repository.findById.mockResolvedValue(null);

        // Act & Assert
        await expect(
          usecase.updateUser('non-existent-id', mockUpdateUserDto)
        ).rejects.toThrow(UnauthorizedException);
        expect(repository.update).not.toHaveBeenCalled();
      });

      it('メールアドレスが既に登録されている場合、ConflictExceptionがスローされること', async () => {
        // Arrange
        repository.findById.mockResolvedValue(mockUserEntity);
        repository.findByEmail.mockResolvedValue(mockOtherUserEntity);

        // Act & Assert
        await expect(
          usecase.updateUser(mockUserEntity.id, mockUpdateUserDto)
        ).rejects.toThrow(ConflictException);
        expect(repository.update).not.toHaveBeenCalled();
      });
    });
  });
});
