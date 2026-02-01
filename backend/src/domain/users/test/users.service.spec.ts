import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../services/users.service';
import { UsersUsecase } from '../usecase/users.usecase';
import {
  mockUserEntity,
  mockUserResponse,
  mockUpdateUserDto,
  mockUpdateUserResponse,
} from './mocks/users.mock';

describe('UsersService', () => {
  let service: UsersService;
  let usecase: jest.Mocked<UsersUsecase>;

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
      it('UseCaseのgetUserが呼び出された場合、結果がそのまま返されること', async () => {
        // Arrange
        usecase.getUser.mockResolvedValue(mockUserResponse);

        // Act
        const result = await service.getUser(mockUserEntity.id);

        // Assert
        expect(result).toEqual(mockUserResponse);
        expect(usecase.getUser).toHaveBeenCalledWith(mockUserEntity.id);
      });
    });

    describe('異常系', () => {
      it('UseCaseでエラーが発生した場合、エラーがそのままスローされること', async () => {
        // Arrange
        const error = new Error('UseCase error');
        usecase.getUser.mockRejectedValue(error);

        // Act & Assert
        await expect(service.getUser(mockUserEntity.id)).rejects.toThrow(error);
        expect(usecase.getUser).toHaveBeenCalledWith(mockUserEntity.id);
      });
    });
  });

  describe('updateUser', () => {
    describe('正常系', () => {
      it('UseCaseのupdateUserが呼び出された場合、結果がそのまま返されること', async () => {
        // Arrange
        usecase.updateUser.mockResolvedValue(mockUpdateUserResponse);

        // Act
        const result = await service.updateUser(
          mockUserEntity.id,
          mockUpdateUserDto
        );

        // Assert
        expect(result).toEqual(mockUpdateUserResponse);
        expect(usecase.updateUser).toHaveBeenCalledWith(
          mockUserEntity.id,
          mockUpdateUserDto
        );
      });
    });

    describe('異常系', () => {
      it('UseCaseでエラーが発生した場合、エラーがそのままスローされること', async () => {
        // Arrange
        const error = new Error('UseCase error');
        usecase.updateUser.mockRejectedValue(error);

        // Act & Assert
        await expect(
          service.updateUser(mockUserEntity.id, mockUpdateUserDto)
        ).rejects.toThrow(error);
        expect(usecase.updateUser).toHaveBeenCalledWith(
          mockUserEntity.id,
          mockUpdateUserDto
        );
      });
    });
  });
});
