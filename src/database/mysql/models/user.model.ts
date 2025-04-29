/**
 * MySQL User 모델
 */

import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('user') // 테이블 이름을 'user' 로 설정
export class UserModel {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  userId!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  name!: string;

  // select: false 옵션은 쿼리 조회 시 기본적으로 선택이 되지 않는 옵션
  @Column({ select: false })
  password!: string;

  @Column({ default: true })
  isLoggedIn?: boolean;

  @Column({ default: true })
  isActive?: boolean;

  @Column({ default: 0 })
  failedLoginAttempts?: number;

  @Column()
  lastLoginDatetime?: Date;

  @Column()
  ipAddress?: string;

  @CreateDateColumn()
  createdAt?: Date;
}