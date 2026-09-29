import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PersonalModule } from './personal/personal.module';
import { ExperienceModule } from './experience/experience.module';
import { EducationModule } from './education/education.module';
import { SkillModule } from './skill/skill.module';
import { GenerateModule } from './generate/generate.module';
import { ResumesModule } from './resumes/resumes.module';
import { TranslateModule } from './translate/translate.module';
import { ExtrasModule } from './extras/extras.module';
import { ImportModule } from './import/import.module';
import { HealthController } from './health.controller';
import { TemplatesController } from './templates/templates.controller';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    TranslateModule,
    AuthModule,
    UsersModule,
    ResumesModule,
    PersonalModule,
    ExperienceModule,
    EducationModule,
    SkillModule,
    ExtrasModule,
    ImportModule,
    GenerateModule,
    AdminModule,
  ],
  controllers: [HealthController, TemplatesController],
})
export class AppModule {}
