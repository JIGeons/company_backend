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
COPY package*.json ./
RUN npm ci
#COPY package.json package-lock.json ./


# 빌드 결과만 복사
COPY --from=builder /app/dist ./dist
#COPY dist ./dist
# 필요한 환경변수 파일 복사 (옵션)
COPY --from=builder /app/.env.prod ./

# 실행
CMD ["node", "dist/src/server.js"]



#FROM node:18-buster-slim
#
#LABEL title='abccompany'
#
## Create /app directory
#RUN mkdir -p /app
#
## Update packages and install required packages
#RUN apt-get update && apt-get install -y \
#    openssh-server \
#    unzip \
#    && sed 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' -i /etc/ssh/sshd_config \
#    && sed -ri 's/UsePAM yes/#UsePAM yes/g' /etc/ssh/sshd_config \
#    && mkdir /var/run/sshd \
#    && echo 'root:ec2-user' | chpasswd \
#    && mkdir /root/.ssh
#
## Set /app as the working directory
#WORKDIR /app
#
## Copy application files
#COPY . /app
#
## Install dependencies
#COPY package.json .
#RUN npm cache clean --force
#RUN npm install --legacy-peer-deps
#
#ARG NODE_ENV=development
#ENV NODE_ENV=$NODE_ENV
#
## Copy the entrypoint script into the container
#COPY entrypoint.sh /entrypoint.sh
#RUN chmod +x /entrypoint.sh
#
## Define the entry point
#ENTRYPOINT ["/entrypoint.sh"]
