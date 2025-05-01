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

  // true - 로그인 상태, false - 로그아웃 상태
  @Column({ default: false })
  isLoggedIn?: boolean;

  // true - 활성화, false - 비활성화
  @Column({ default: true })
  isActive?: boolean;

  @Column({ default: 0 })
  failedLoginAttempts?: number;

  @Column({ nullable: true })
  lastLoginDatetime?: Date;

  @Column({ nullable: true })
  ipAddress?: string;

  @Column({ nullable: true })
  verificationCode?: string;

  @CreateDateColumn()
  createdAt?: Date;
}