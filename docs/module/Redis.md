# Redis 모듈 설명

상태를 저장하거나 공유하지 않고, 각 기능을 명확히 분리한 함수 기반 구조로 작성하였다. </br> 
모든 Redis 작업은 입력과 출력이 명확한 함수로 추상화했고,</br>
Redis에 직접 접근하는 비즈니스 로직은 서비스 계층에서만 수행되도록 설계하였다.

Redis는 명령 처리(RedisClient)와 이벤트 감지(RedusSubscriber)를 위해 두 개의 클라이언트를 사용한다.

---

### ✅ 일반 명령용 - RedisClient

- `Get`, `Set`, `Delete` 등 기본적인 데이터 조회, 저장, 삭제 작업을 처리한다.
- `Set` 명령의 경우 동일한 key에 새로운 데이터를 set하면 업데이트하는 것과 같은 효과를 볼 수 있다.
- 주로 API 동작 시 호출되는 Redis 명령은 이 클라이언트를 통해 수행된다.

---

### ✅ 이벤트 감지용 - RedisSubscriber

- Key TTL 만료 이벤트를 감지하기 위해 사용된다.
- 특히, AccessToken을 Redis에 TTL 기반으로 저장함으로써, 만료 시점에 이벤트를 수신하여 **자동 로그아웃 처리**를 트리거 한다.
- 이를 통해 서버는 별도의 cron이나 스케줄러 없이 토큰 만료 시점에 자동 로그아웃 처리를 수행할 수 있다.
- Redis의 `notify-keyspace-events` 설정을 통해 `__keyevent@0__:expired` 채널을 구독하고 있다.

---

### ✅ Redis에 저장되는 데이터 종류

현재 Redis에는 다음과 같은 목적의 데이터를 저장하고 있다.

1. 자동 로그아웃을 위한 AccessToken
2. AccessToken 만료 시 재발급을 위한 RefreshToken
3. 로그아웃 시 사용되었던 AccessToken (BlackList 처리)

---

### ✅ Redis Key 네이밍 전략

각 데이터를 명확히 구분하기 위해, Redis key에 접두어(Prefix)를 붙인다.
Prefix는 다음과 같은 Enum으로 정의되어 있고, 실제 key는 `'접두어:키[:session]'` 으로 정의된다.

```tsx
// 수식어와 key값은 ‘:’를 통해 구분한다.
export enum RedisStoreKeyActionEnum {
  LOGIN = "LOGIN",
  BLACKLIST = "BLACKLIST",
  REFRESH = "REFRESH",
}
```

- `LOGIN` 키의 경우, TTL 이벤트 처리를 위해 `:session` suffix를 추가한다.

### 🔑 예시:

- `LOGIN:user-id:session`
- `REFRESH:user-id`
- `BLACKLIST:access-token`

---

## 📁 코드 분리 및 설계 원칙

이 Redis 모듈은 **관심사의 분리(Separation of Concerns)** 와 **역할 기반 책임 분리(SRP)** 를 기반으로 다음과 같은 구조로 관리했다.

### ✅ `redis.config.ts`

- **역할**: Redis 클라이언트 초기화 및 설정
- **책임**
    - Redis 연결 (명령용 / 이벤트용 클라이언트)
    - `notify-keyspace-events` 설정
    - 앱 실행 시 `initializeRedis()`를 한 번만 호출하여 Redis 연동 및 이벤트 구독을 설정함
- **이유**: Redis의 초기 연결 설정만을 관리하는 파일이기 때문에 config로 분리

---

### ✅ `redis.service.ts`

- **역할**: Redis 관련 비즈니스 로직 수행
- **책임**
    - TTL 만료 이벤트 수신 후 로그아웃 처리
    - Redis CRUD 처리 (`set`, `get`, `del`)
- **이유**: Redis 서버에 직접적인 CRUD를 수행하는 비즈니스 로직이기 때문에 서비스 계층으로 분리

---

### ✅ `redis.util.ts`

- **역할**: Redis Key 조립 및 파싱 유틸
- **책임**
    - Enum 기반 Key 문자열 생성
    - Redis Key 구조 파싱
- **이유**: Redis 서버에 직접 접근하지 않기 때문에 순수 유틸리티 함수로 분리

---