import {IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  username!: string;

  @IsNotEmpty()
  @IsString()
  password!: string;
}

export class UpdateUserDto {
  @IsNotEmpty()
  @IsString()
  id!: string;

  @IsOptional()
  @IsString()
  username?: string;

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
  lastLoginAttempt?: number;

  @IsOptional()
  @IsString()
  ipAddress?: string;
}