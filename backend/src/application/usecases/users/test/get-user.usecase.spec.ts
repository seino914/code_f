/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { GetUserUseCase, GetUserInput } from '../get-user.usecase';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../../domain/repositories/user.repository.interface';
import { User } from '../../../../domain/entities/user.entity';

describe('GetUserUseCase', () => {
  let useCase: GetUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    password: 'hashedPassword123',
    name: 'Test User',
    company: 'Test Company',
    failedLoginAttempts: 0,
    lockedUntil: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserUseCase,
        {
          provide: USER_REPOSITORY,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetUserUseCase>(GetUserUseCase);
    userRepository = module.get(USER_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    describe('正常系', () => {
      it('ユーザーが存在する場合、ユーザー情報が返されること', async () => {
        // Arrange
        const input: GetUserInput = { userId: mockUser.id };
        userRepository.findById.mockResolvedValue(mockUser);

        // Act
        const result = await useCase.execute(input);

        // Assert
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual({
            id: mockUser.id,
            email: mockUser.email,
            name: mockUser.name,
            company: mockUser.company,
          });
        }
        expect(userRepository.findById).toHaveBeenCalledWith(mockUser.id);
      });
    });

    describe('異常系', () => {
      it('ユーザーが存在しない場合、USER_NOT_FOUNDエラーが返されること', async () => {
        // Arrange
        const input: GetUserInput = { userId: 'non-existent-id' };
        userRepository.findById.mockResolvedValue(undefined);

        // Act
        const result = await useCase.execute(input);

        // Assert
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.type).toBe('USER_NOT_FOUND');
          expect(result.error.message).toBe('ユーザーが見つかりません');
        }
        expect(userRepository.findById).toHaveBeenCalledWith('non-existent-id');
      });
    });
  });
});
