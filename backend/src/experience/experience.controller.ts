import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ExperienceService } from './experience.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';
import { CreateExperienceDto, UpdateExperienceDto } from './dto/experience.dto';

@Controller('resumes/:resumeId/experiences')
@UseGuards(JwtAuthGuard)
export class ExperienceController {
  constructor(private readonly experienceService: ExperienceService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Param('resumeId') resumeId: string) {
    return this.experienceService.list(user.id, resumeId);
  }

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Param('resumeId') resumeId: string,
    @Body() dto: CreateExperienceDto,
  ) {
    return this.experienceService.create(user.id, resumeId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('resumeId') resumeId: string,
    @Param('id') id: string,
    @Body() dto: UpdateExperienceDto,
  ) {
    return this.experienceService.update(user.id, resumeId, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: AuthUser,
    @Param('resumeId') resumeId: string,
    @Param('id') id: string,
  ) {
    return this.experienceService.remove(user.id, resumeId, id);
  }
}
