import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';
import { ImportService } from './import.service';
import { ApplyImportDto } from './dto/apply-import.dto';

@Controller('resumes/:resumeId/import')
@UseGuards(JwtAuthGuard)
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('parse')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 8 * 1024 * 1024 },
    }),
  )
  parse(
    @CurrentUser() user: AuthUser,
    @Param('resumeId') resumeId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Fichier requis (champ "file")');
    }
    return this.importService.parseUpload(user.id, resumeId, file);
  }

  @Post('apply')
  apply(
    @CurrentUser() user: AuthUser,
    @Param('resumeId') resumeId: string,
    @Body() dto: ApplyImportDto,
  ) {
    return this.importService.applyDraft(user.id, resumeId, dto);
  }
}
