# JWT 인증 설계 방식 </br>(JWT 기반 인증 시스템 개선)

### 문제

1. Access Token을 HTTP-only Cookie에 저장하여 클라이언트에서 AccessToken을 제어하기 어렵고,
   REST 아키텍처에서는 상태 정보를 클라이언트가 관리하는 원칙을 위반한다.
   또, Cookie는 웹에 최적화되어 있으므로 다양한 클라이언트 환경(웹, 앱 등)에서 사용하기 어렵다.
2. 기존 Access Token 만을 사용하여 사용자 인증을 진행하고, Access Token의 만료 시간을 24시간으로 설정하여 토큰 탈취 시 24시간 동안 서버는 무방비해진다.
3. Access Token 이 만료된 경우 사용자가 로그아웃을 하고 싶어도 로그아웃을 하지 못한다.
   로그인을 하려면 DB에서 직접 변경해야 하는 치명적인 오류가 있다.

### 기존 설계 원칙

- 해당 서버에서의 로그인은 관리자 로그인을 전제로 한다.
  그렇기 때문에 사용자가 로그인을 한 경우 다른 클라이언트 환경에서 중복 로그인하는 것을 제안하여 사용자의 로그인 상태를 DB에서 직접 관리한다.

### 기존 설계 원칙에 대응 방법

- DB에서 로그인 상태를 관리하는 컬럼은 유지.
- 사용자가 로그인한 Access Token을 Redis에 `LOGIN` 상태로 관리한다. 관리 시 key는 `LOGIN:userId:session`로 한다.
- TTL 만료 시 키의 userId로 로그아웃용 임시 토큰을 생성하여 로그아웃 API를 호출한다.

### 로그인 시 Access Token,  Refresh Token 을 생성

- Access Token은 `LOGIN` 상태로 TTL 만료 시간을 6시간으로 설정하여 Redis에 저장하고,
- Refresh Token은 `REFRESH` 상태로 Redis에 저장한다.

### Access Token만 사용하던 기존 서비스에서 Refresh Token을 도입하여 보안 향상

- 기존 Access Token을 24시간으로 설정하여 Access Token이 탈취된 경우 24시간 동안 서버가 무방비해지는 문제가 존재
- 이를 해결하기 위해 Refresh Token Rotation 패턴을 도입.
- Access Token 만료 시간을 15분으로 짧게 하고,
  Access Token이 만료될 때 토큰 재발급 API를 활용하여 Access, Refresh 토큰을 재발급 받는다.
- 기존의 Refresh Token은 폐기하고, 새로운 Refresh Token을 Redis에 key: `REFRESH:userId` , map: JSON.stringify({ refreshToken: refreshToken }) 상태로 저장하여 refresh 토큰을 관리.

## 토큰 재발급 API

### refresh 미들웨어 구현

- 토큰 재발급 API 서비스 로직 실행 전 refresh 미들웨어를 통해 Access Token이 만료된 토큰인지, Refresh Token이 유효한 토큰인지 확인하는 필터링 진행

### 정상적인 Refresh Token인지 확인하는 비즈니스 로직 작성 (비정상 접근 확인 로직)

- 요청한 Refresh Token과 Redis에 저장된 Refresh Token이 동일한지 확인.
- Refresh Token도 Access Token과 같이 15분마다 갱신이되므로 이전에 사용한 Refresh Token은 사용이 불가능.
- 현재 Redis에 저장된 Refresh Token이 아닌경우 Refresh Token이 탈취되어 비정상적으로 Access Token을 발급하려는 목적이라고 간주하여 해당 계정을 잠금하고, 계정주 메일로 해당 요청 IP와 요청 시간, 랜덤으로 생성한 인증번호로 계정 활성화 URL을 생성하고 `abnormalAccess.template.ejs`를 통해 렌더링한 html string을 메일 본문으로 전송한다.
- 계정 활성화 URL은 랜덤으로 생성한 인증번호와, userId를 query 값으로 넣어 생성하고,
  랜덤으로 생성한 인증번호는 DB에 저장이 된다.

### 토큰 재발급 완료 시

- 재발급된 Access Token을 Redis에 저장된 `LOGIN` 상태를 TTL과 함께 갱신한다.
- 재발급된 Refresh Token을 Redis에 저장된 `REFRESH` 상태를 갱신하여 기존 Refresh Token을 폐기하고, 새로운 Refresh Token을 저장한다.

## 사용자 계정 활성화 API

### GET - /api/auth/verify?userId={}&code={}

- 해당 API로 GET 요청 시 `account-verify.template.ejs` 파일을 렌더링하여 html String을 반환한다.
- 원래는 Client에서 생성해야 하는 페이지지만 백엔드 서버를 구현하고 있어 해당 페이지를 ejs 파일을 렌더링하여 반환하는 식으로 하였다.

### POST - /api/auth/verify?userId={}&code={}

- ejs 파일로 렌더링된 페이지에 userId와 passward를 입력하여 사용자 인증을 진행한다.
- 이때, query로 userId, code를 전송하고, body 데이터로 userId와 password를 전송한다.
- query의 userId와 body의 userId가 같은 경우, 인증을 이어서 진행한다.
- userId로 사용자의 정보를 조회하고, password를 비교한다.
- password가 같은 경우 code와 사용자 DB에 저장된 verification Code를 비교하여 같은 경우 사용자 계정 주 본인이라고 간주하여 계정을 활성화 한다.

### Logout 서비스 로직 수정 (BlackList 추가)

[ 문제 ]

- 기존 Logout 서비스의 경우 간단히 DB의 로그인 상태만 변경하는 로직이었음.
- JWT 토큰에 대한 아무런 처리가 없어, JWT 토큰의 만료 까지 시간이 남은 경우 로그아웃 상태지만 Access Token을 사용하여 다른 API 호출 등 서버 보안적 문제가 있다.

[ 해결 방법 ]

- Logout 서비스 진행시 기존에 사용하던 Access Token에 잔여 만료 시간을 계산한다.
- 계산 이후 Access Token을 Redis의 `BLACKLIST` 상태로 저장한다.
- 저장 시 Key: `BLACKLIST:{accessToken}`, Map: JSON.stringify({ userId: userId }) 형태로 저장을 하고 TTL은 Access Token의 잔여 만료 시간 만큼 설정하여 잔여 시간동안 해당 Access Token을 사용하지 못하도록 관리한다.

## token.service.ts

`token.service.ts`는 Access, Refresh, Temporary 토큰의 발급, 토큰 유효성 인증, Redis에 Token 조회 / 저장 / 삭제 기능을 하는 함수형 구조의 서비스이다.

함수형 구조로 작성한 이유

- token 서비스의 경우 토큰의 상태를 구현체에서 관리할 필요가 없으므로 함수형 구조로 작성하였다.