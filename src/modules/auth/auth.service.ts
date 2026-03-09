import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { MstUserRepository } from './repository/mst-user.repository';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly mstUserRepository: MstUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    if (dto.password !== dto.repassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const existingUser = await this.mstUserRepository.findByUsername(dto.username);
    if (existingUser) {
      throw new BadRequestException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.mstUserRepository.createUser({
      username: dto.username,
      password: hashedPassword,
      name: dto.name,
    });

    return {
      message: 'User registered successfully',
      userId: user.id,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.mstUserRepository.findByUsername(dto.username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, username: user.username };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async getProfile(userId: string) {
    const user = await this.mstUserRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const { password, ...result } = user;
    return result;
  }

  async updateProfile(userId: string, data: any) {
    const user = await this.mstUserRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (data.old_password) {
      const passwordMatch = await bcrypt.compare(data.old_password, user.password);
      if (!passwordMatch) {
        throw new BadRequestException('Old password incorrect');
      }
    }

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.password) {
        if (data.password !== data.repassword) {
            throw new BadRequestException('Passwords do not match');
        }
        updateData.password = await bcrypt.hash(data.password, 10);
    }

    await this.mstUserRepository.updateUser(userId, updateData);

    return {
      message: 'Profile updated successfully',
    };
  }
}
