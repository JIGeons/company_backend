/** @type {import('ts-jest').JestConfigWithTsJest} **/
// ts-jest를 사용하는 Jest 설정임을 명시하는 타입 선언 (자동 완성 및 타입 체크 지원)

module.exports = {
  preset: 'ts-jest',
  // 테스트 실행 환경을 Node.js로 설정 (브라우저 환경이 아닌 경우 이 설정을 사용)
  testEnvironment: "node",
  roots: ['<rootDir>/tests'], // Jest가 테스트를 찾을 디렉토리 목록. 기본값은 ["<rootDir>"].
  testMatch: [
    // 테스트 파일 경로 패턴 지정:
    // tests 디렉토리 내부 integration, unit만 테스트 지정
    '**/tests/integration/**/*.test.ts',
    '**/tests/unit/**/*.test.ts'
  ],
  transform: {
    // .ts 또는 .tsx 파일을 ts-jest를 이용해 반환
    "^.+\.tsx?$": ["ts-jest",{}],
    // 정규식: 확장자가 .ts또는 .tsx로 끝나는 파일을 ts-jest로 변환
  },

  // 콘솔 출력
  silent: false,

  // 테스트 커버리지 리포트를 생성
  collectCoverage: true,
  coverageDirectory: "coverage/",

  // Jest가 모듈을 찾을 때 참조할 디렉토리들
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapper: {
    "^@/(.*)$": '<rootDir>/src/$1', // @/로 시작하는 import를 src 디렉토리로 매핑
    "^@controllers/(.*)$": "<rootDir>/src/controllers/$1",
    "^@exceptions/(.*)$": "<rootDir>/src/exceptions/$1",
    "^@interfaces/(.*)$": "<rootDir>/src/interfaces/$1",
    "^@middlewares/(.*)$": "<rootDir>/src/middlewares/$1",
    "^@config/(.*)$": "<rootDir>/src/config/$1",
    "^@database/(.*)$": "<rootDir>/src/database/$1",
    "^@models/(.*)$": "<rootDir>/src/database/models/$1",
    "^@routes/(.*)$": "<rootDir>/src/routes/$1",
    "^@services/(.*)$": "<rootDir>/src/services/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@tests/(.*)$": "<rootDir>/tests/$1",
  }
};