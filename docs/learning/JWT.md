# JWT
JWT(Json Web Token)은 사용자 인증 및 권한 부여에 사용되는 웹 표준 방식으로, 클라이언트와 서버 간에 정보를 안전하게 전송하는데 사용된다.

세션 기반 인증 방식과 달리, JWT는 토큰에 필요한 정보를 담고 있어 서버에서 세션을 관리할 필요가 없어 확장성이 좋고 서버 부하를 줄일 수 있다.

## JWT의 특징

### 1. Stateless (무상태)

- 서버가 세션 상태를 별도로 저장할 필요 없이, 토큰 자체에 사용자 정보를 담아 처리할 수 있다.

### 2. 안정성 (URL-safe)

- Base64Url 인코딩을 사용해 HTTP 환경에서도 안전하게 주고받을 수 있다.

### 3. 간편성 (self-contained)

- 필요한 인증 정보가 토큰 자체에 포함되어 있어, 별도의 데이터베이스 조회 없이도 사용자 상태를 판단할 수 있다.

### 4. 가볍고 효율적 (Compact)

- 짧은 문자열로 인코딩되어 HTTP 헤더, URL 파라미터 등에 부담 없이 실을 수 있다.

## JWT의 구성 요소

JWT는 Header, Payload, Signature 3가지로 구성이 되어있으며, 각 구성요소는 JSON 객체를 Base64Url로 인코딩되어 표현되고, 인코딩된 각 구성요소를 점(.)으로 구분한다.

### 헤더 (Header)

Header는 토큰의 타입(JWT)과 서명에 사용된 알고리즘(HS256 등)이 들어있다.

```tsx
{
  "alg": "HS256",     // 서명에 사용된 알고리즘 방식을 지정
  "typ": "JWT",       // 토큰의 타입을 지정
}
```

### 페이로드 (Payload)

Payload는 실제로 담고자 하는 “클레임(Claim)”을 포함한다.
클레임은 토큰에 담기는 정보 조각을 의미하며, 다음과 같은 종류가 있다.

- **등록된(Registered) 클레임**: 토큰 처리에 일반적으로 사용되는 표준 클레임
    - 예: `iss`(발급자), `exp`(만료시간), `sub`(주제), `aud`(대상자)
- **공개(Public) 클레임**: 자유롭게 정의할 수 있는 공용 정보
    - 예: `userId`, `email`, `role`
- **비공개(Private) 클레임**: 클라이언트와 서버 간에 별도로 합의된 사용자 정의 정보

```tsx
// Base64Url로 인코딩 될 Payload JSON 객체 정보
{
  "sub": "1234567890",
  "name": "Hong gildong",
  "admin": true,
}
// 실제 JWT 토큰의 payload를 디코딩한 정보
{
  "userId":"67f668ebe24ea6e057939449",
  "username":"admin",
  "iat":1745844070,     // exp - iat = 21600( 6시간 = 21600초 )
  "exp":1745865670,
}
```

### 서명 (Signature)

Signature는 JWT의 무결성을 검증하기 위해 생성된다.
Header와 Payload를 인코딩한 문자열을 연결하고, 이를 서버의 비밀 키(Secret Key) 와 함께 서명하여 생성한다.

Signature를 만드는 공식은 아래와 같다.

```javascript
// Header + Payload를 SecretKey를 가지고 SHA256 해시로 서명한다.
HMACSHA256(
    base64UrlEncode(Header) + "." + base64UrlEncode(Payload),
    SecretKey
)
```

## JWT의 활용 및 주의 사항

### 🔹 JWT 활용

- **로그인 인증 (Authorization)**
    - 로그인 성공 시, 서버가 JWT를 발급해주고 이후 요청마다 JWT를 통해 사용자 인증
- **OAuth 2.0 / OpenID Connect**
    - 구글, 네이버, 카카오 로그인 같은 소셜 로그인에서 인증 토큰으로 사용
- **정보 교환 (Information Exchange)**
    - 안전하게 정보(예: 사용자 ID, 권한)를 주고 받을 때
    - 마이크로서비스 아키텍처(MSA) 간의 인증
    - 클라이언트 - 서버 간 정보 교환

### 🔸 JWT 사용 시 주의사항

- **Payload는 암호화되어 있지 않다.**
    - JWT를 단순 디코딩하면 Payload의 내용은 누구나 볼 수 있기 때문에, 설계 시 정보 선택에 신중해야 한다.

      ![jwt 토큰 디코딩.jpeg](attachment:97349fb8-7780-431e-be1c-28c5274dc72f:jwt_토큰_디코딩.jpeg)

    - 민감한 정보(비밀번호, 주민번호 등)는 절대 저장해서는 안된다.
- **토큰 탈취에 주의해야한다.**
    - 반드시 HTTPS를 사용하여 네트워크 구간을 보호해야한다.
- **만료시간(exp)을 설정해야 한다.**
    - 무기한 유효한 토큰은 보안 위협이 크므로 적절한 만료 정책을 설정해야한다.
    - 서버가 Stateless하게 동작하기 때문에, 발급한 토큰을 중간에 무효화하기 쉽지 않다.
    - 이를 보완하기 위해 블랙리스트(BlackList) 방식이나 짧은 만료시간 설정 + 리프레시 토큰(Refresh Token) 전략을 사용한다.
- **Secret Key를 안전하게 관리해야한다.**
    - Secret Key가 유출되면 누구나 유효한 토큰을 발급할 수 있게 되어, 시스템 전체가 위험해질 수 있다.

## JWT 토큰의 장단점

### 장점

- 서버가 상태를 저장하지 않아 확장이 매우 쉽다.
- 인증 처리가 빠르다. (DB 조회 없이 토큰만 검증하면 끝난다.)
- 다양한 플랫폼(웹, 모바일, 서버 간 통신)에서 사용하기 편리하다.

### 단점

- 토큰이 탈취되면 만료 전까지 계속 사용될 위험이 있다.
- 토큰을 폐기하기가 어렵다. (별도 BlackList 관리가 필요하다.)
- Payload가 노출될 수 있어 민감한 정보 저장에 주의해야한다.

## JWT 토큰이 사용되는 사례

### 1. 서버 수가 많거나, 마이크로서비스(MSA) 아키텍처를 사용하는 경우

- Stateless 구조가 확장성과 유지보수에 유리하다.

### 2. 다양한 플랫폼(웹/앱/서버 간 통신 등)을 넘나드는 경우

- 다양한 클라이언트와 서버 간 토큰 전달이 용이하다.

## Refresh Token 전략

### 전략의 필요성

- Access Token은 일반적으로 서버가 기억하지 않는다 - Stateless
- 클라이언트가 탈취당하면 만료(exp) 전까지 악용 가능하다.

따라서, Access Token을 짧게 만료시킨다.

하지만 Access Token을 너무 짧게 하면 사용자가 계속 로그인해야 하는 불편이 생긴다. </br>
이 문제를 해결하기 위해, </br>
”Refresh Token으로 Access Token을 재발급”하는 구조를 도입한다.

### 🔹 다회성 Refresh Token

1. 로그인 시 Access Token과 Refresh Token을 발급하고, Refresh Token은 HTTP-only Cookie에 저장하여 응답한다.
2. 발급 받은 Refresh Token은 DB나 Redis 등 서버에 저장을 한다.
3. API 요청 시 Access Token을 검증한다.
4. Access Token이 만료된 경우 Cookie에 Refresh Token이 유효한 토큰인지 검증을 한다.
5. 유효한 토큰인 경우 Access Token은 재발급한다.

```
[Login]
 └─> [Access Token 발급 (짧은 수명)]
 └─> [Refresh Token 발급 (긴 수명)]

[API 요청 시]
 └─> Access Token 검증 → 성공 시 요청 처리
 
[Access Token 만료 시]
 └─> Refresh Token 서버 제출 → 검증 → 새 Access Token 발급
```

### 🔹 일회성 Refresh Token (Rotation 방식)

- 다회성 Refresh Token과 동작 방식(1 ~ 4번)이 동일하다.
1. Access Token을 발행시 Refresh Token도 함께 발행한다.
2. 기존 Refresh Token은 폐기하고, 새로 발행한 Refresh Token을 서버(DB 또는 Redis 등)에 저장한다.
3. 새로 발행한 Refresh Token으로 HTTP-only Cookie를 갱신하고, Access Token을 응답한다.

```
[Login]
 └─> [Access Token 발급 (짧은 수명)]
 └─> [Refresh Token 발급 (긴 수명)]

[API 요청 시]
 └─> Access Token 검증 → 성공 시 요청 처리
 
[Access Token 만료 시]
 └─> Refresh Token 서버 제출 → 검증 → 새 Access Token 발급
 └─> Refresh Token도 갱신 → 서버 저장(DB or Redis 등)
```

## JWT 사용 시 발생할 수 있는 보안 이슈 및 방어 방법

| 주요 이슈 | 설명 |
| --- | --- |
| 탈취(Token Theft) | 토큰이 클라이언트 측 또는 네트워크에서 탈취될 수 있다. |
| 만료 시간 관리 실패 | 토큰이 무제한으로 유효하거나, 너무 길게 유효하면 탈취 시 피해가 커진다. |
| 민감 정보 노출 | Payload는 암호화되지 않아 누구나 디코딩하여 볼 수 있다. |
| 서명 알고리즘 관련 취약점 | 잘못된 알고리즘 설정(예: `alg: none`)으로 인해 서명 검증이 무력화될 수 있다. |
| Refresh Token 관리 실패 | Refresh Token 탈취 또는 무효화 실패 시 재로그인 없이 장기간 악용될 수 있다. |
| Replay Attack(재사용 공격) | 탈취한 토큰을 재전송하여 공격하는 방식이다. |

### 1. 탈취 (Token Theft)

문제:

- 클라이언트(localStorage, sessionStorage)에서 JavaScript를 통해 접근 가능한 토큰이 XSS(스크립트 공격)로 탈취될 수 있다.
- HTTPS가 없는 경우 네트워크 중간자 공격(Man-in-the-Middle Attack)으로 토큰이 유출될 수 있다.

방어 방법:

- 항상 HTTPS를 사용하여 토큰 전송 구간을 암호화한다.
- HttpOnly Cookie를 사용해 JavaScript에터 토큰에 접근할 수 없게 만든다.
- 클라이언트 애플리케이션에서 XSS 방어(콘텐츠 보안 정책(CSP) 적용, 입력값 검증 등)를 철저히 한다.
- 토큰 저장 위치는 localStorage 대신 Secure Cookie를 권장한다.

---

### 2. 만료 시간 관리 실패

문제:

- 토큰 만료(exp) 시간을 너무 길게 설정하면 탈취 시 위험 기간이 길어진다.
- 토큰을 무기한으로 사용하는 경우 위험이 극대화된다.

방어 방법:

- Access Token의 만료 시간을 짧게 설정한다. (예: 15분 이내)
- Refresh Token을 사용하여 짧은 Access Token을 주기적으로 갱신한다.
- Refresh Token에도 반드시 만료(exp)를 설정한다.

---

### 3. 민감 정보 노출

문제:

- JWT Payload는 Base64Url 인코딩되어 있을 뿐, 암호화된 것이 아니다.
- 누구나 쉽게 Payload를 디코딩하여 내용을 볼 수 있다.

방어 방법:

- 절대 민감한 정보(비밀번호, 주민번호, 카드번호 등)는 Payload에 저장하지 않는다.
- 사용자 ID, 권한 정보(role) 등 최소한의 정보만 담는다.
- 민감 정보가 꼭 필요하다면 별도로 암호화하거나 토큰 외부에서 관리한다.

---

### 4. 서명 알고리즘 취약점

문제:

- 잘못된 JWT 라이브러리 설정으로 `alg: none`을 허용할 경우, 서명 검증 없이 토큰을 통과시킬 수 있다.
- 대칭키(HS256) 대신 비대칭키(RS256)을 사용할 때 키 관리를 잘못하면 위조 토큰이 통과될 수 있다.

방어 방법:

- 서버에서 alg(알고리즘)를 명시적으로 고정한다. (예: HS256만 수락)
- JWT 라이브러리에서 `alg: none`을 허용하지 않게 강제한다.
- 비대칭키(RS256) 사용하는 경우, 공개키 / 개인키 관리에 주의한다.

---

### 5. Refresh Token 관리 실패

문제:

- Refresh Token을 탈취당하면 장기간 Access Token 재발급이 가능해진다.
- 만약 Refresh Token을 서버에서 무효화(BlackList)하지 못하면 리스크가 커진다.

방어 방법:

- Refresh Token은 HttpOnly, Secure 속성을 가진 쿠키에 저장한다.
- Refresh Token Rotation 전략(한번 쓰면 교체)을 적용한다.
- Refresh Token 재발급 시, 사용자에게 이메일 알림이나 푸시 알림으로 통지할 수 있다.

---

### 6. Replay Attact (재사용 공격)

문제:

- 탈취한 토큰을 동일한 서버에 다시 보내서 불법 접근하는 공격이다.

방어 방법:

- 각 요청마다 JWT만이 아니라, 추가적인 요청 ID(Nonce)를 사용해 재사용을 방지한다.
- 중요한 요청(API)에는 2차 인증(2FA)을 적용한여 한 번 더 사용자 확인을 거친다.
- Refresh Token 사용 시 Rotation 전략을 적용해 한 번 사용한 토큰은 다시 사용할 수 없게 만든다. 