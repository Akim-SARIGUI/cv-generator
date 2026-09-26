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
import { ExtrasService } from './extras.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';
import { CreateExtraDto, UpdateExtraDto } from './dto/extra.dto';

@Controller('resumes/:resumeId/extras')
@UseGuards(JwtAuthGuard)
export class ExtrasController {
  constructor(private readonly extrasService: ExtrasService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Param('resumeId') resumeId: string) {
    return this.extrasService.list(user.id, resumeId);
  }

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Param('resumeId') resumeId: string,
    @Body() dto: CreateExtraDto,
  ) {
    return this.extrasService.create(user.id, resumeId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('resumeId') resumeId: string,
    @Param('id') id: string,
    @Body() dto: UpdateExtraDto,
  ) {
    return this.extrasService.update(user.id, resumeId, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: AuthUser,
    @Param('resumeId') resumeId: string,
    @Param('id') id: string,
  ) {
    return this.extrasService.remove(user.id, resumeId, id);
  }
}
