import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpsertPersonalDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  fullName!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  linkedinUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  githubUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  websiteUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  summary?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  objective?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  photoUrl?: string;
}
