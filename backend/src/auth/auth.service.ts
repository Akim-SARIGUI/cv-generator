import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { adminEmails } from '../common/admin-emails';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const publicUserSelect = {
  id: true,
  email: true,
  username: true,
  role: true,
  createdAt: true,
} as const;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email.toLowerCase() }, { username: dto.username }],
      },
    });

    if (existing) {
      throw new ConflictException('Email ou nom d’utilisateur déjà utilisé');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const email = dto.email.toLowerCase();
    const user = await this.prisma.user.create({
      data: {
        email,
        username: dto.username,
        passwordHash,
        role: this.roleFor(email),
        resumes: {
          create: {
            title: 'Mon CV',
            isDefault: true,
            personal: {
              create: {
                fullName: dto.username,
                email,
              },
            },
          },
        },
      },
      select: publicUserSelect,
    });

    return {
      user,
      accessToken: await this.signToken(user.id, user.email),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const role = this.roleFor(user.email);
    const promoted =
      role === UserRole.ADMIN && user.role !== UserRole.ADMIN
        ? await this.prisma.user.update({
            where: { id: user.id },
            data: { role },
            select: publicUserSelect,
          })
        : null;

    return {
      user: promoted ?? {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
      },
      accessToken: await this.signToken(user.id, user.email),
    };
  }

  private roleFor(email: string): UserRole {
    return adminEmails(this.config).has(email.toLowerCase())
      ? UserRole.ADMIN
      : UserRole.USER;
  }

  private signToken(userId: string, email: string) {
    return this.jwtService.signAsync({ sub: userId, email });
  }
}
