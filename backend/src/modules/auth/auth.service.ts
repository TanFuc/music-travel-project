import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ERROR_CODES, getErrorMessage } from '@/common/constants/error-codes.constant';
import { JwtPayload } from '@/common/decorators/current-user.decorator';
import { CacheService } from '@/cache/cache.service';
import { CacheKeys, CACHE_TTL } from '@/cache/cache-keys.constant';

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse extends TokenResponse {
  user: {
    id: number;
    phoneNumber: string;
    fullName: string;
    email: string | null;
    role: string;
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly cache: CacheService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    // Check if phone number already exists
    const existingUser = await this.usersService.findByPhoneNumber(registerDto.phoneNumber);
    if (existingUser) {
      throw new ConflictException({
        code: ERROR_CODES.USER_002,
        message: getErrorMessage(ERROR_CODES.USER_002),
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const user = await this.usersService.create({
      phoneNumber: registerDto.phoneNumber,
      passwordHash,
      fullName: registerDto.fullName,
      email: registerDto.email,
    });

    // Generate tokens
    const tokens = await this.generateTokens({
      sub: user.id,
      phoneNumber: user.phoneNumber,
      role: user.role,
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByPhoneNumber(loginDto.phoneNumber);

    if (!user) {
      throw new UnauthorizedException({
        code: ERROR_CODES.AUTH_001,
        message: getErrorMessage(ERROR_CODES.AUTH_001),
      });
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException({
        code: ERROR_CODES.AUTH_004,
        message: getErrorMessage(ERROR_CODES.AUTH_004),
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException({
        code: ERROR_CODES.AUTH_001,
        message: getErrorMessage(ERROR_CODES.AUTH_001),
      });
    }

    // Generate tokens
    const tokens = await this.generateTokens({
      sub: user.id,
      phoneNumber: user.phoneNumber,
      role: user.role,
    });

    this.logger.log(`User ${user.id} logged in successfully`);

    return {
      ...tokens,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('app.jwt.refreshSecret'),
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException({
          code: ERROR_CODES.AUTH_002,
          message: getErrorMessage(ERROR_CODES.AUTH_002),
        });
      }

      return this.generateTokens({
        sub: user.id,
        phoneNumber: user.phoneNumber,
        role: user.role,
      });
    } catch {
      throw new UnauthorizedException({
        code: ERROR_CODES.AUTH_002,
        message: getErrorMessage(ERROR_CODES.AUTH_002),
      });
    }
  }

  async logout(userId: number, accessToken?: string): Promise<{ message: string }> {
    // Invalidate user session cache
    await this.cache.del(CacheKeys.userSession(userId));
    await this.cache.del(CacheKeys.userProfile(userId));

    // Optionally blacklist the token if provided
    if (accessToken) {
      const tokenKey = CacheKeys.tokenBlacklist(accessToken);
      await this.cache.set(tokenKey, true, CACHE_TTL.TOKEN_BLACKLIST);
    }

    this.logger.log(`User ${userId} logged out`);
    return { message: 'Đăng xuất thành công.' };
  }

  /**
   * Check if a token is blacklisted
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    const key = CacheKeys.tokenBlacklist(token);
    return await this.cache.exists(key);
  }

  async getProfile(userId: number) {
    const cacheKey = CacheKeys.userProfile(userId);

    // Try cache first
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException({
        code: ERROR_CODES.USER_001,
        message: getErrorMessage(ERROR_CODES.USER_001),
      });
    }

    const profile = {
      id: user.id,
      phoneNumber: user.phoneNumber,
      fullName: user.fullName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: user.role,
      createdAt: user.createdAt,
    };

    // Cache profile for 30 minutes
    await this.cache.set(cacheKey, profile, CACHE_TTL.STANDARD);

    return profile;
  }

  private async generateTokens(payload: JwtPayload): Promise<TokenResponse> {
    const expiresIn = this.configService.get<string>('app.jwt.expiresIn', '1d');
    const expiresInSeconds = this.parseExpiresIn(expiresIn);

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('app.jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('app.jwt.refreshExpiresIn', '7d'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: expiresInSeconds,
    };
  }

  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 86400; // Default 1 day

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };

    return value * (multipliers[unit] || 86400);
  }
}
