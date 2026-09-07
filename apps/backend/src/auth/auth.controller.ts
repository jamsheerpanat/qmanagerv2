import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  UnauthorizedException,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { SUPER_ADMIN_ROLE } from '../common/roles';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private prisma: PrismaService,
  ) {}

  @Post('login')
  async login(@Body() body: any) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('refresh')
  async refresh(@Body() body: any) {
    if (!body.userId || !body.refreshToken) {
      throw new UnauthorizedException('Invalid payload');
    }
    return this.authService.refreshTokens(body.userId, body.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req) {
    await this.authService.logout(req.user.id);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        companyId: true,
        branchId: true,
        roles: {
          select: {
            role: {
              select: {
                name: true,
                permissions: {
                  select: { permission: { select: { action: true } } },
                },
              },
            },
          },
        },
      },
    });

    if (!user) throw new UnauthorizedException();

    const permissions = new Set<string>();
    user.roles.forEach((ur) => {
      ur.role.permissions.forEach((rp) =>
        permissions.add(rp.permission.action),
      );
    });

    // PermissionsGuard short-circuits on Super Admin and never consults the
    // permission rows, so a Super Admin is authorised for everything server
    // side regardless of what is attached to the role. This endpoint drives the
    // UI, so it has to report the same thing — otherwise the API accepts a
    // request that the interface gives no way to make.
    const isSuperAdmin = user.roles.some(
      (ur) => ur.role.name === SUPER_ADMIN_ROLE,
    );

    // Formatting it cleanly for the frontend
    const mappedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      status: user.status,
      companyId: user.companyId,
      branchId: user.branchId,
      roles: user.roles.map((r) => r.role.name),
      permissions: Array.from(permissions),
      isSuperAdmin,
    };

    return mappedUser;
  }
}
