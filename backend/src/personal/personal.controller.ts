import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
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
}
