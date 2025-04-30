# Redis.ts 설명
Redis는 명령 처리(RedisClient)와 이벤트 감지(RedusSubscriber)를 위해 두 개의 클라이언트를 사용한다.

---

### ✅ 일반 명령용 - RedisClient

- `Get`, `Set`, `Delete` 등 기본적인 데이터 조회, 저장, 삭제 작업을 처리한다.
- 주로 API 동작 시 호출되는 Redis 명령은 이 클라이언트를 통해 수행된다.

---

### ✅ 이벤트 감지용 - RedisSubscriber

- Key TTL 만료 이벤트를 감지하기 위해 사용된다.
- 특히, 로그아웃 처리용 AccessToken이 만료되었을 때, 이벤트를 수신하여 **자동 로그아웃 처리**를 트리거 한다.
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
  LOGOUT = "LOGOUT",
  BLACKLIST = "BLACKLIST",
  REFRESH = "REFRESH",
}

// 예시
LOGOUT:access-token:session
REFRESH:user-id
BLACKLIST:access-token
```

- `LOGOUT` 키의 경우, TTL 이벤트 처리를 위해 `:session` suffix를 추가한다.