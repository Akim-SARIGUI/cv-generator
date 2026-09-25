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
import { SkillService } from './skill.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';
import { CreateSkillDto, UpdateSkillDto } from './dto/skill.dto';

@Controller('resumes/:resumeId/skills')
@UseGuards(JwtAuthGuard)
export class SkillController {
  constructor(private readonly skillService: SkillService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Param('resumeId') resumeId: string) {
    return this.skillService.list(user.id, resumeId);
  }

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Param('resumeId') resumeId: string,
    @Body() dto: CreateSkillDto,
  ) {
    return this.skillService.create(user.id, resumeId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('resumeId') resumeId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSkillDto,
  ) {
    return this.skillService.update(user.id, resumeId, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: AuthUser,
    @Param('resumeId') resumeId: string,
    @Param('id') id: string,
  ) {
    return this.skillService.remove(user.id, resumeId, id);
  }
}
