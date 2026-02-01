import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../controllers/users.controller';
import { UsersService } from '../services/users.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import {
  mockUserFromToken,
  mockUserResponse,
  mockUpdateUserDto,
  mockUpdateUserResponse,
} from './mocks/users.mock';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

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
      it('ServiceのgetUserが呼び出され、結果がそのまま返されること', async () => {
        // Arrange
        usersService.getUser.mockResolvedValue(mockUserResponse);

        // Act
        const result = await controller.getUser(mockUserFromToken);

        // Assert
        expect(result).toEqual(mockUserResponse);
        expect(usersService.getUser).toHaveBeenCalledWith(mockUserFromToken.id);
      });
    });

    describe('異常系', () => {
      it('Serviceでエラーが発生した場合、エラーがそのままスローされること', async () => {
        // Arrange
        const error = new Error('Service error');
        usersService.getUser.mockRejectedValue(error);

        // Act & Assert
        await expect(controller.getUser(mockUserFromToken)).rejects.toThrow(
          error
        );
        expect(usersService.getUser).toHaveBeenCalledWith(mockUserFromToken.id);
      });
    });
  });

  describe('updateUser', () => {
    describe('正常系', () => {
      it('ServiceのupdateUserが呼び出され、結果がそのまま返されること', async () => {
        // Arrange
        usersService.updateUser.mockResolvedValue(mockUpdateUserResponse);

        // Act
        const result = await controller.updateUser(
          mockUserFromToken,
          mockUpdateUserDto
        );

        // Assert
        expect(result).toEqual(mockUpdateUserResponse);
        expect(usersService.updateUser).toHaveBeenCalledWith(
          mockUserFromToken.id,
          mockUpdateUserDto
        );
      });
    });

    describe('異常系', () => {
      it('Serviceでエラーが発生した場合、エラーがそのままスローされること', async () => {
        // Arrange
        const error = new Error('Service error');
        usersService.updateUser.mockRejectedValue(error);

        // Act & Assert
        await expect(
          controller.updateUser(mockUserFromToken, mockUpdateUserDto)
        ).rejects.toThrow(error);
        expect(usersService.updateUser).toHaveBeenCalledWith(
          mockUserFromToken.id,
          mockUpdateUserDto
        );
      });
    });
  });
});
