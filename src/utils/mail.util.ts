/**
 * mail.util.ts
 */
import fs from 'fs';
import path from 'path';
import ejs from 'ejs';

export async function renderMailTemplate(templateName: string, data: Record<string, any>): Promise<string> {
  // '.src/'로 시작하는 template path  생성
  const templatePath = path.resolve(__dirname, `../../templates/${templateName}.template.ejs`);

  try {
    // 템플릿 렌더링
    const template = fs.readFileSync(templatePath, 'utf-8');
    return ejs.render(template, data);
  } catch (err) {
    console.error(`❌ 템플릿 렌더링 실패 (${templateName}):`, err);
    throw new Error(`템플릿 렌더링 실패: ${templateName}`);
  }
}