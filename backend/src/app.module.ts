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
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ResumesModule,
    PersonalModule,
    ExperienceModule,
    EducationModule,
    SkillModule,
    GenerateModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
