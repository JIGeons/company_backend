import {IsNotEmpty, IsString, IsEmail, IsPhoneNumber, IsEnum, IsOptional} from 'class-validator';

// enum
import { ContactStatusEnum } from "@utils/enum";

export class CreateContactDto {
  @IsNotEmpty()
  @IsString()
  public name!: string ;

  @IsNotEmpty()
  @IsEmail()
  public email!: string;

  @IsNotEmpty()
  @IsString()
  public phone!: string;

  @IsNotEmpty()
  @IsString()
  public message!: string;

  @IsNotEmpty()
  @IsEnum(ContactStatusEnum)
  public status!: ContactStatusEnum;
}

export class UpdateContactDto {
  @IsNotEmpty()
  @IsString()
  public id!: string;

  @IsOptional()
  @IsString()
  public name?: string ;

  @IsOptional()
  @IsEmail()
  public email?: string;

  @IsOptional()
  @IsString()
  public phone?: string;

  @IsOptional()
  @IsString()
  public message?: string;

  @IsOptional()
  @IsEnum(ContactStatusEnum)
  public status?: ContactStatusEnum;
}