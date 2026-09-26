import { Body, Controller, Get, Param, Post, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { GenerateService } from './generate.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';

class GeneratePdfDto {
  @IsOptional()
  @IsString()
  @IsIn(['fr', 'en'])
  locale?: string;
}

@Controller('resumes/:resumeId/generate')
@UseGuards(JwtAuthGuard)
export class GenerateController {
  constructor(private readonly generateService: GenerateService) {}

  @Get('localized')
  localized(
    @CurrentUser() user: AuthUser,
    @Param('resumeId') resumeId: string,
    @Query('locale') locale?: string,
  ) {
    return this.generateService.getLocalizedResume(user.id, resumeId, locale);
  }

  @Post('pdf')
  generatePdf(
    @CurrentUser() user: AuthUser,
    @Param('resumeId') resumeId: string,
    @Body() body: GeneratePdfDto,
    @Res() res: Response,
  ) {
    return this.generateService.generatePdf(user.id, resumeId, res, body?.locale);
  }
}
