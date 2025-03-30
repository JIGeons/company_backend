#FROM ubuntu:latest
#LABEL authors="choejiseong"
#
#ENTRYPOINT ["top", "-b"]

# 1. Node.js 이미지를 베이스로 사용
FROM node:18

# 2. 작업 디렉토리 설정
WORKDIR /app

# 3. package.json 및 package-lock.json 복사 후 의존성 설치
COPY package*.json ./
RUN npm install

# 4. 모든 코드 복사
COPY . .

# 5. Express 서버가 사용하는 포트 개방 (ex: 3000)
EXPOSE 3000

# 6. 서버 실행
CMD ["npm", "start"]