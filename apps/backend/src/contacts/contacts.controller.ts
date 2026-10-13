import {
  Controller,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('customers/:customerId/contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @RequirePermissions('customers.update')
  @Post()
  create(
    @Param('customerId') customerId: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.contactsService.create(customerId, body, req.user.id);
  }

  @RequirePermissions('customers.update')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.contactsService.update(id, body);
  }

  @RequirePermissions('customers.update')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contactsService.remove(id);
  }
}
