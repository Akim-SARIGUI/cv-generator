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
import { EducationService } from './education.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';
import { CreateEducationDto, UpdateEducationDto } from './dto/education.dto';

@Controller('resumes/:resumeId/educations')
@UseGuards(JwtAuthGuard)
export class EducationController {
  constructor(private readonly educationService: EducationService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Param('resumeId') resumeId: string) {
    return this.educationService.list(user.id, resumeId);
  }

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Param('resumeId') resumeId: string,
    @Body() dto: CreateEducationDto,
  ) {
    return this.educationService.create(user.id, resumeId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('resumeId') resumeId: string,
    @Param('id') id: string,
    @Body() dto: UpdateEducationDto,
  ) {
    return this.educationService.update(user.id, resumeId, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: AuthUser,
    @Param('resumeId') resumeId: string,
    @Param('id') id: string,
  ) {
    return this.educationService.remove(user.id, resumeId, id);
  }
}
