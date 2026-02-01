import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../services/auth.service';
import { AuthUsecase } from '../usecase/auth.usecase';
import {
  mockLoginDto,
  mockRegisterDto,
  mockLoginResponse,
  mockRegisterResponse,
} from './mocks/auth.mock';

describe('AuthService', () => {
  let service: AuthService;
  let usecase: jest.Mocked<AuthUsecase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AuthUsecase,
          useValue: {
            login: jest.fn(),
            register: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usecase = module.get(AuthUsecase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    describe('正常系', () => {
      it('UseCaseのloginが呼び出された場合、結果がそのまま返されること', async () => {
        // Arrange
        usecase.login.mockResolvedValue(mockLoginResponse);

        // Act
        const result = await service.login(mockLoginDto);

        // Assert
        expect(result).toEqual(mockLoginResponse);
        expect(usecase.login).toHaveBeenCalledWith(mockLoginDto);
      });
    });

    describe('異常系', () => {
      it('UseCaseでエラーが発生した場合、エラーがそのままスローされること', async () => {
        // Arrange
        const error = new Error('UseCase error');
        usecase.login.mockRejectedValue(error);

        // Act & Assert
        await expect(service.login(mockLoginDto)).rejects.toThrow(error);
        expect(usecase.login).toHaveBeenCalledWith(mockLoginDto);
      });
    });
  });

  describe('register', () => {
    describe('正常系', () => {
      it('UseCaseのregisterが呼び出された場合、結果がそのまま返されること', async () => {
        // Arrange
        usecase.register.mockResolvedValue(mockRegisterResponse);

        // Act
        const result = await service.register(mockRegisterDto);

        // Assert
        expect(result).toEqual(mockRegisterResponse);
        expect(usecase.register).toHaveBeenCalledWith(mockRegisterDto);
      });
    });

    describe('異常系', () => {
      it('UseCaseでエラーが発生した場合、エラーがそのままスローされること', async () => {
        // Arrange
        const error = new Error('UseCase error');
        usecase.register.mockRejectedValue(error);

        // Act & Assert
        await expect(service.register(mockRegisterDto)).rejects.toThrow(error);
        expect(usecase.register).toHaveBeenCalledWith(mockRegisterDto);
      });
    });
  });
});
