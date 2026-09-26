import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

const SKILL_CATEGORIES = ['TECHNICAL', 'SOFT', 'TOOL', 'OTHER'] as const;

export class CreateSkillDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  name!: string;

  @IsOptional()
  @IsIn(SKILL_CATEGORIES)
  category?: (typeof SKILL_CATEGORIES)[number];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  proficiency?: number;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class UpdateSkillDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @IsIn(SKILL_CATEGORIES)
  category?: (typeof SKILL_CATEGORIES)[number];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  proficiency?: number;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
