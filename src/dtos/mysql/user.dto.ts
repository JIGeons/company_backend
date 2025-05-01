import {IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  userId!: string;

  @IsNotEmpty()
  @IsString()
  email!: string;

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  password!: string;
}

export class UpdateUserDto {
  @IsNotEmpty()
  @IsString()
  id!: number;

  @IsOptional()
  @IsString()
  userId!: string;

  @IsOptional()
  @IsString()
  email!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsBoolean()
  isLoggedIn?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  failedLoginAttempts?: number;

  @IsOptional()
  @IsDate()
  lastLoginDatetime?: Date;

  @IsOptional()
  @IsString()
  verificationCode?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;
}