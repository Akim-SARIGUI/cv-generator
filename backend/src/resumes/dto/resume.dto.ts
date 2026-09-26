import {
  IsBoolean,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TEMPLATE_IDS } from '../../common/cv-templates';

const ALLOWED_TEMPLATES = [...TEMPLATE_IDS, 'classic'];

export class CreateResumeDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsString()
  @IsIn(ALLOWED_TEMPLATES)
  template?: string;

  @IsOptional()
  @IsString()
  @IsIn(['fr', 'en'])
  locale?: string;
}

export class UpdateResumeDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @IsIn(ALLOWED_TEMPLATES)
  template?: string;

  @IsOptional()
  @IsString()
  @IsIn(['fr', 'en'])
  locale?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsObject()
  sections?: Record<string, boolean>;
}
