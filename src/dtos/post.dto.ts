/**
 * Post Dtos
 */
import { IsNotEmpty, IsNumber, IsString, IsArray } from "class-validator";

export class CreatePostDto {
  @IsNotEmpty()
  @IsNumber()
  number!: number;

  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsNotEmpty()
  @IsString()
  content!: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true }) // 배열 안의 모든 요소가 문자열인지 확인.
  fileUrl!: [string];
}

export class UpdatePostDto {
  @IsNotEmpty()
  @IsString()
  id!: string;

  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  fileUrl!: string;

  updatedAt: Date;

  constructor(partial?: Partial<UpdatePostDto>) {
    Object.assign(this, partial);
    this.updatedAt = new Date();  // 현재 시간으로 자동 설정
  }
}