import {
  IsBoolean,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { isValidTemplateId } from '../../common/cv-templates';

@ValidatorConstraint({ name: 'isCvTemplate', async: false })
class IsCvTemplateConstraint implements ValidatorConstraintInterface {
  validate(value: unknown) {
    return typeof value === 'string' && isValidTemplateId(value);
  }

  defaultMessage() {
    return 'Modèle de CV invalide';
  }
}

export class CreateResumeDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  @Validate(IsCvTemplateConstraint)
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
  @MaxLength(64)
  @Validate(IsCvTemplateConstraint)
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
