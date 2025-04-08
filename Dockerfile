# Step 1: Build Stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Step 2: Run Stage
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

# tsconfig-paths 포함된 실행 환경 만들기
RUN npm install tsconfig-paths --save

# 빌드 결과만 복사
COPY --from=builder /app/dist ./dist

# 실행
CMD ["node", "-r", "tsconfig-paths/register", "dist/src/server.js"]
