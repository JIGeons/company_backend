/**
 * Mail Util 파일
 */
import nodemailer from 'nodemailer';
import { mailConfig } from '@config/mail.config';
import { Container } from "typedi";

// SMTP 서버 연결 및 SMTP 객체 생성
export function createMailTransporter() {
  const mailTransporter = nodemailer.createTransport({
    ...mailConfig,
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
  });

  Container.set("mailTransporter", mailTransporter);
  console.log("SMTP 연결 완료");
}
