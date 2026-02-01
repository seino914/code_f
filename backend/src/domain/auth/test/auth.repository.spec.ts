import { Test, TestingModule } from '@nestjs/testing';
import { AuthRepository } from '../repository/auth.repository';
import { PrismaService } from '../../../database/prisma/prisma.service';
import {
  mockUserEntity,
  mockRegisterDto,
  mockLockedUserEntity,
} from './mocks/auth.mock';

describe('AuthRepository', () => {
  let repository: AuthRepository;
  let prismaService: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthRepository,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<AuthRepository>(AuthRepository);
    prismaService = module.get(PrismaService) as typeof prismaService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    describe('正常系', () => {
      it('ユーザーが存在する場合、ユーザー情報が返されること', async () => {
        // Arrange
        prismaService.user.findUnique.mockResolvedValue(mockUserEntity);

        // Act
        const result = await repository.findByEmail(mockUserEntity.email);

        // Assert
        expect(result).toEqual(mockUserEntity);
        expect(prismaService.user.findUnique).toHaveBeenCalledWith({
          where: { email: mockUserEntity.email },
        });
      });
    });

    describe('異常系', () => {
      it('ユーザーが存在しない場合、nullが返されること', async () => {
        // Arrange
        prismaService.user.findUnique.mockResolvedValue(null);

        // Act
        const result = await repository.findByEmail('non-existent@example.com');

        // Assert
        expect(result).toBeNull();
      });
    });
  });

  describe('create', () => {
    describe('正常系', () => {
      it('有効なユーザーデータの場合、ユーザーが作成されること', async () => {
        // Arrange
        const createData = {
          email: mockRegisterDto.email,
          password: 'hashedPassword123',
          name: mockRegisterDto.name,
          company: mockRegisterDto.company,
          failedLoginAttempts: 0,
          lockedUntil: null,
        };
        const createdUser = {
          ...mockUserEntity,
          ...createData,
        };
        prismaService.user.create.mockResolvedValue(createdUser);

        // Act
        const result = await repository.create(createData);

        // Assert
        expect(result).toEqual(createdUser);
        expect(prismaService.user.create).toHaveBeenCalledWith({
          data: createData,
        });
      });
    });
  });

  describe('update', () => {
    describe('正常系', () => {
      it('有効な更新データの場合、ユーザー情報が更新されること', async () => {
        // Arrange
        const updateData = {
          failedLoginAttempts: 0,
          lockedUntil: null,
        };
        const updatedUser = {
          ...mockLockedUserEntity,
          ...updateData,
        };
        prismaService.user.update.mockResolvedValue(updatedUser);

        // Act
        const result = await repository.update(mockUserEntity.id, updateData);

        // Assert
        expect(result).toEqual(updatedUser);
        expect(prismaService.user.update).toHaveBeenCalledWith({
          where: { id: mockUserEntity.id },
          data: updateData,
        });
      });
    });
  });
});

