import { AuthRepository, authRepository } from '../repositories/auth.repository';
import { UserRepository, userRepository } from '../repositories/user.repository';
import {
  LoginUseCase,
  RegisterUseCase,
  LogoutUseCase,
} from '../../application/usecases/auth';
import {
  GetUserUseCase,
  UpdateUserUseCase,
} from '../../application/usecases/users';

/**
 * DIコンテナ
 * ユースケースとリポジトリのインスタンスを管理
 */
class Container {
  // リポジトリ
  private _authRepository: AuthRepository;
  private _userRepository: UserRepository;

  // ユースケース
  private _loginUseCase: LoginUseCase | undefined;
  private _registerUseCase: RegisterUseCase | undefined;
  private _logoutUseCase: LogoutUseCase | undefined;
  private _getUserUseCase: GetUserUseCase | undefined;
  private _updateUserUseCase: UpdateUserUseCase | undefined;

  constructor() {
    // リポジトリの初期化
    this._authRepository = authRepository;
    this._userRepository = userRepository;
  }

  // ユースケースのゲッター（遅延初期化）
  get loginUseCase(): LoginUseCase {
    if (!this._loginUseCase) {
      this._loginUseCase = new LoginUseCase(this._authRepository);
    }
    return this._loginUseCase;
  }

  get registerUseCase(): RegisterUseCase {
    if (!this._registerUseCase) {
      this._registerUseCase = new RegisterUseCase(this._authRepository);
    }
    return this._registerUseCase;
  }

  get logoutUseCase(): LogoutUseCase {
    if (!this._logoutUseCase) {
      this._logoutUseCase = new LogoutUseCase(this._authRepository);
    }
    return this._logoutUseCase;
  }

  get getUserUseCase(): GetUserUseCase {
    if (!this._getUserUseCase) {
      this._getUserUseCase = new GetUserUseCase(this._userRepository);
    }
    return this._getUserUseCase;
  }

  get updateUserUseCase(): UpdateUserUseCase {
    if (!this._updateUserUseCase) {
      this._updateUserUseCase = new UpdateUserUseCase(this._userRepository);
    }
    return this._updateUserUseCase;
  }
}

/**
 * シングルトンのDIコンテナインスタンス
 */
export const container = new Container();
