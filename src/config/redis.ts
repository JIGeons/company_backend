/**
 * Redis 연결 및 이벤트 처리 구독 설정 파일
 */

import {createClient} from 'redis';
import {REDIS_URI} from "@config/index";
import {logoutHandler} from "@/listeners/logout.handler";
import {RedisStoreKeyActionEnum} from "@utils/enum";
import {Result} from "@interfaces/result.interface";

// 일반 명령용 클라이언트
export const redisClient = createClient({ url: REDIS_URI });

// pub/sub 이벤트 감지용 클라이언트
export const redisSubscriber = createClient({ url: REDIS_URI });

// 호이스팅 되는 메서드
export async function initializeRedis() {
  // 명령용 클라이언트 연결
  await redisClient.connect()
    .then(() => {console.log("✅ Redis 명령용 연결 완료")})
    .catch(error => {console.error("❌ Redis 명령용 연결 실패: ", error);});

  // pub/sub용 클라이언트 연결
  await redisSubscriber.connect()
    .then(() => {console.log("✅ Redis 이벤트용 연결 완료")})
    .catch(error => {console.error("❌ Redis 이벤트용 연결 실패: ", error);});

  // TTL 만료 이벤트 설정
  await initRedisSubscription(redisClient);

  // TTL 만료 시 이벤트 발생 핸들러
  await redisTTLEventHandler(redisSubscriber);

  console.log('💡 Redis expired 이벤트 구독 시작');
}

/**
 * TTL 만료시 이벤트 발생도록 설정하는 메서드
 * @param redisClient - 일반 명령용 Redis Client
 */
const initRedisSubscription = async (redisClient:any) => {
  // TTL 이벤트 수신을 위한 notify 설정 (redis 전체 설정)
  await redisClient.configSet('notify-keyspace-events', 'Ex').then(() => {
    console.log('✅ Redis 연결 및 이벤트 설정 완료');
  }).catch((error: any) => {
    console.error('❌ Redis 연결 및 이벤트 설정 실패: ', error);
  });  // TTL 만료 이벤트 구독
}

/**
 * TTL 만료 시 발생하는 이벤트 로직
 * @param redisSubscriber - 이벤트 구독용 Redis Client
 */
const redisTTLEventHandler = async (redisSubscriber: any) => {
  // 구독 시작: Redis 에서 TTL(Time-To-Live)이 만료되어 자동으로 삭제될 때 발생하는 이벤트
  await redisSubscriber.pSubscribe('__keyevent@0__:expired', (message: string) => {
    console.log('🕓 TTL 만료 감지: ', message);

    const keyName = getKeyName(message);
    // Logout key가 TTL 만료된 경우 로그아웃 처리
    if (keyName.prefix === RedisStoreKeyActionEnum.LOGOUT && keyName.suffix === 'session') {
      logoutHandler(keyName.key); // 로그아웃 처리
    }
    // if (message.startsWith(`${RedisStoreKeyActionEnum.LOGOUT}:`) && message.endsWith(':session')) {
    //   const accessToken = message.split(':')[1];
    //   logoutHandler(accessToken); // 로그아웃 처리
    // }
  });
}

export const getDataToRedis = async (keyAction: RedisStoreKeyActionEnum, key: string): Promise<Result> => {
  const keyName = createKeyName(keyAction, key);
  const result:Result = { success: false, data: null };

  const redisResult = await redisClient.get(keyName);
  if (!redisResult) return result;

  // redis에서 데이터 조회에 성공한 경우
  result.success = true;
  result.data = JSON.parse(redisResult);

  return result;
}

// Redis에 데이터 저장 (호이스팅이 되지 않는 메서드)
export const storeToRedis = async (keyAction: RedisStoreKeyActionEnum, key: string, data: object, ttlTime: number): Promise<Result> => {
  const keyName = createKeyName(keyAction, key);
  const result: Result = { success: false, data: null };

  try {
    // Redis에 저장
    await redisClient.set(keyName, JSON.stringify(data), { EX: ttlTime });
    result.success = true;
    result.data = { key: keyName };
  } catch (error) {
    console.error(`Redis 저장 실패 [${keyName}]:`, error);
    result.error = error instanceof Error ? error.message : String(error);
  }

  return result;
}

// Redis의 데이터 삭제
export const deleteToRedis = async (keyAction: RedisStoreKeyActionEnum, key: string): Promise<Result> => {
  const keyName = createKeyName(keyAction, key);
  const result: Result = { success: false, data: null };

  try {
    // Redis에서 삭제
    const deleteResult = await redisClient.del(keyName);
    result.success = deleteResult > 0;
    result.data = { deleteResult };
  } catch (error) {
    console.error(`Redis 삭제 실패 [${keyName}]:`, error);
    result.error = error instanceof Error ? error.message : String(error);
  }

  return result;
}

/**
 * Key 이름을 조합하는 메서드
 * @param keyAction - RedisStoreKeyActionEnum['LOGOUT', 'BLACKLIST', 'REFRESH']
 * @param key - 유니크한 Redis key
 */
const createKeyName = (keyAction: RedisStoreKeyActionEnum, key: string) => {
  let keyName = `${keyAction}:${key}`;
  // key Action이 로그아웃인 경우 뒤에 ':session' 추가
  if (keyAction === RedisStoreKeyActionEnum.LOGOUT) {
    keyName += ':session';
  }

  return keyName;
}

const getKeyName = (keyName: string) => {
  // keyName을 구조분해 할당. suffix가 없는 경우 null을 기본값으로 설정
  const [ prefix, key, suffix = null ] = keyName.split(':');

  return { prefix, key, suffix };
}