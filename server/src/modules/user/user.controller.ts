import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, TenantId } from '../../common';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../shared';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ResetUserPasswordDto, UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Staff & Team Access Management')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'List all staff users in the store' })
  @Roles(UserRole.OWNER, UserRole.STORE_MANAGER)
  async listUsers(@TenantId() tenantId: string): Promise<{ data: Record<string, any>[] }> {
    return { data: await this.userService.listUsers(tenantId) };
  }

  @Post()
  @ApiOperation({ summary: 'Add a new cashier or store manager (enforces plan limit)' })
  @Roles(UserRole.OWNER, UserRole.STORE_MANAGER)
  async createUser(@TenantId() tenantId: string, @Body() dto: CreateUserDto) {
    const data = await this.userService.createUser(tenantId, dto);
    return { message: `Staff member ${data.fullName} created successfully`, data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update staff member profile, role or active status' })
  @Roles(UserRole.OWNER, UserRole.STORE_MANAGER)
  async updateUser(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser('userId') currentUserId: string,
  ) {
    const data = await this.userService.updateUser(tenantId, id, dto, currentUserId);
    return { message: 'Staff member updated successfully', data };
  }

  @Post(':id/reset-password')
  @ApiOperation({ summary: 'Reset temporary password for staff user' })
  @Roles(UserRole.OWNER, UserRole.STORE_MANAGER)
  async resetPassword(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: ResetUserPasswordDto,
  ) {
    return this.userService.resetPassword(tenantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate and delete staff user' })
  @Roles(UserRole.OWNER)
  async deleteUser(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @CurrentUser('userId') currentUserId: string,
  ) {
    return this.userService.deleteUser(tenantId, id, currentUserId);
  }
}
