import { Controller, Param, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { GenerateService } from './generate.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';

@Controller('resumes/:resumeId/generate')
@UseGuards(JwtAuthGuard)
export class GenerateController {
  constructor(private readonly generateService: GenerateService) {}

  @Post('pdf')
  generatePdf(
    @CurrentUser() user: AuthUser,
    @Param('resumeId') resumeId: string,
    @Res() res: Response,
  ) {
    return this.generateService.generatePdf(user.id, resumeId, res);
  }
}
