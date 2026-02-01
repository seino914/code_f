import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from '../repository/users.repository';
import { PrismaService } from '../../../database/prisma/prisma.service';
import {
  mockUserEntity,
  mockUpdateUserDto,
  mockUpdatedUserEntity,
} from './mocks/users.mock';

describe('UsersRepository', () => {
  let repository: UsersRepository;
  let prismaService: {
    user: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
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

    repository = module.get<UsersRepository>(UsersRepository);
    prismaService = module.get(PrismaService) as typeof prismaService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    describe('正常系', () => {
      it('ユーザーが存在する場合、ユーザー情報が返されること', async () => {
        // Arrange
        prismaService.user.findUnique.mockResolvedValue(mockUserEntity);

        // Act
        const result = await repository.findById(mockUserEntity.id);

        // Assert
        expect(result).toEqual(mockUserEntity);
        expect(prismaService.user.findUnique).toHaveBeenCalledWith({
          where: { id: mockUserEntity.id },
        });
      });
    });

    describe('異常系', () => {
      it('ユーザーが存在しない場合、nullが返されること', async () => {
        // Arrange
        prismaService.user.findUnique.mockResolvedValue(null);

        // Act
        const result = await repository.findById('non-existent-id');

        // Assert
        expect(result).toBeNull();
      });
    });
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

  describe('update', () => {
    describe('正常系', () => {
      it('更新データが正しく渡され、更新されたユーザー情報が返されること', async () => {
        // Arrange
        prismaService.user.update.mockResolvedValue(mockUpdatedUserEntity);

        // Act
        const result = await repository.update(
          mockUserEntity.id,
          mockUpdateUserDto
        );

        // Assert
        expect(result).toEqual(mockUpdatedUserEntity);
        expect(prismaService.user.update).toHaveBeenCalledWith({
          where: { id: mockUserEntity.id },
          data: mockUpdateUserDto,
        });
      });
    });
  });
});
