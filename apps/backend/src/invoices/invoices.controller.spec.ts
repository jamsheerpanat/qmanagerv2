import { Test, TestingModule } from '@nestjs/testing';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';

describe('InvoicesController', () => {
  let controller: InvoicesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvoicesController],
      providers: [{ provide: InvoicesService, useValue: {} }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<InvoicesController>(InvoicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('enforces permissions, not just authentication', () => {
    // Regression guard: the controller once declared @RequirePermissions
    // without PermissionsGuard, which made every one of them inert.
    const guards = Reflect.getMetadata('__guards__', InvoicesController) ?? [];
    expect(guards).toContain(PermissionsGuard);
    expect(guards).toContain(JwtAuthGuard);
  });
});
