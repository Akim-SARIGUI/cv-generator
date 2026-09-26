import {
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ApplyPersonalDto {
  @IsOptional() @IsString() @MaxLength(120) fullName?: string;
  @IsOptional() @IsString() @MaxLength(120) email?: string;
  @IsOptional() @IsString() @MaxLength(40) phone?: string;
  @IsOptional() @IsString() @MaxLength(200) address?: string;
  @IsOptional() @IsString() @MaxLength(300) linkedinUrl?: string;
  @IsOptional() @IsString() @MaxLength(300) githubUrl?: string;
  @IsOptional() @IsString() @MaxLength(300) websiteUrl?: string;
  @IsOptional() @IsString() @MaxLength(5000) summary?: string;
  @IsOptional() @IsString() @MaxLength(3000) objective?: string;
}

class ApplyExperienceDto {
  @IsString() @MaxLength(120) jobTitle!: string;
  @IsString() @MaxLength(120) company!: string;
  @IsOptional() @IsString() @MaxLength(120) location?: string;
  @IsOptional() @IsString() startDate?: string | null;
  @IsOptional() @IsString() endDate?: string | null;
  @IsOptional() @IsBoolean() currentJob?: boolean;
  @IsOptional() @IsString() @MaxLength(5000) description?: string;
}

class ApplyEducationDto {
  @IsString() @MaxLength(160) degree!: string;
  @IsString() @MaxLength(160) institution!: string;
  @IsOptional() @IsString() @MaxLength(120) location?: string;
  @IsOptional() @IsString() startDate?: string | null;
  @IsOptional() @IsString() endDate?: string | null;
  @IsOptional() @IsBoolean() currentEducation?: boolean;
  @IsOptional() @IsString() @MaxLength(3000) description?: string;
}

class ApplySkillDto {
  @IsString() @MaxLength(80) name!: string;
  @IsOptional()
  @IsIn(['TECHNICAL', 'SOFT', 'TOOL', 'OTHER'])
  category?: 'TECHNICAL' | 'SOFT' | 'TOOL' | 'OTHER';
}

class ApplyExtraDto {
  @IsIn(['LANGUAGE', 'CERTIFICATION', 'AWARD', 'PROJECT', 'INTEREST', 'REFERENCE'])
  kind!:
    | 'LANGUAGE'
    | 'CERTIFICATION'
    | 'AWARD'
    | 'PROJECT'
    | 'INTEREST'
    | 'REFERENCE';
  @IsString() @MaxLength(160) title!: string;
  @IsOptional() @IsString() @MaxLength(160) subtitle?: string;
  @IsOptional() @IsString() @MaxLength(80) dateLabel?: string;
  @IsOptional() @IsString() @MaxLength(3000) description?: string;
  @IsOptional() @IsString() @MaxLength(300) url?: string;
}

export class ApplyImportDto {
  @ValidateNested()
  @Type(() => ApplyPersonalDto)
  personal!: ApplyPersonalDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApplyExperienceDto)
  experiences!: ApplyExperienceDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApplyEducationDto)
  educations!: ApplyEducationDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApplySkillDto)
  skills!: ApplySkillDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApplyExtraDto)
  extras!: ApplyExtraDto[];

  @IsOptional()
  @IsBoolean()
  replaceExisting?: boolean;
}
