import { Module } from '@nestjs/common';
import { AdminBootstrap } from './admin.bootstrap';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService, AdminBootstrap],
})
export class AdminModule {}
