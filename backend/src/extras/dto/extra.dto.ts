import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ExtraKind } from '@prisma/client';

export class CreateExtraDto {
  @IsEnum(ExtraKind)
  kind!: ExtraKind;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  subtitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  dateLabel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  url?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class UpdateExtraDto {
  @IsOptional()
  @IsEnum(ExtraKind)
  kind?: ExtraKind;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  subtitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  dateLabel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  url?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
