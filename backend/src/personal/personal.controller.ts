import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PersonalService } from './personal.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';
import { UpsertPersonalDto } from './dto/personal.dto';

@Controller('resumes/:resumeId/personal')
@UseGuards(JwtAuthGuard)
export class PersonalController {
  constructor(private readonly personalService: PersonalService) {}

  @Get()
  get(@CurrentUser() user: AuthUser, @Param('resumeId') resumeId: string) {
    return this.personalService.get(user.id, resumeId);
  }

  @Put()
  upsert(
    @CurrentUser() user: AuthUser,
    @Param('resumeId') resumeId: string,
    @Body() dto: UpsertPersonalDto,
  ) {
    return this.personalService.upsert(user.id, resumeId, dto);
  }

  @Post('photo')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: memoryStorage(),
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  uploadPhoto(
    @CurrentUser() user: AuthUser,
    @Param('resumeId') resumeId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.personalService.uploadPhoto(user.id, resumeId, file);
  }

  @Delete('photo')
  removePhoto(
    @CurrentUser() user: AuthUser,
    @Param('resumeId') resumeId: string,
  ) {
    return this.personalService.removePhoto(user.id, resumeId);
  }
}
