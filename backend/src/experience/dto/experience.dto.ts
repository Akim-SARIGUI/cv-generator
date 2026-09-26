import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateExperienceDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  jobTitle!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  company!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  location?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  currentJob?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class UpdateExperienceDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  jobTitle?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  company?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  location?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  currentJob?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
