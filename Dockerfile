# 빌드 스테이지에서는 devDependencies 포함해서 빌드 (tsc 필요하니까)
FROM node:18-alpine AS builder

WORKDIR /app

# 패키지 파일 복사
COPY package*.json ./

# devDependencies 포함 설치 (tsc 등 빌드 도구용)
RUN npm ci

# 소스코드 복사
COPY . .

# TypeScript 빌드
RUN npm run build

# 실행 스테이지에서는 devDependencies 제거
FROM node:18-alpine

WORKDIR /app

# 실행에 필요한 의존성만 설치
#COPY package*.json ./
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps
#COPY package.json package-lock.json ./


# 빌드 결과만 복사
COPY --from=builder /app/dist ./dist
#COPY dist ./dist
# 필요한 환경변수 파일 복사 (옵션)
COPY --from=builder /app/.env.prod ./

# 실행
CMD ["node", "dist/src/server.js"]