/**
 * redis.service.ts
 * Redis CRUD 등 서비스 관련 파일
 */
import { redisClient } from '@config/redis.config';
import { RedisStoreKeyActionEnum } from "@utils/enum";

// Interface
import { Result } from "@interfaces/result.interface";

// Handler
import { logoutRequestHandler } from "@/listeners/logout.handler";

// utils
import { createKeyName, getKeyName } from "@utils/redis.util";

/**
 * TTL 만료 시 발생하는 이벤트 로직
 * @param redisSubscriber - 이벤트 구독용 Redis Client
 */
export const redisTTLEventHandler = async (redisSubscriber: any) => {
  // 구독 시작: Redis 에서 TTL(Time-To-Live)이 만료되어 자동으로 삭제될 때 발생하는 이벤트
  await redisSubscriber.pSubscribe('__keyevent@0__:expired', (message: string) => {
    console.log('🕓 TTL 만료 감지: ', message);

    const keyName = getKeyName(message);
    // LOGIN key가 TTL 만료된 경우 로그아웃 처리
    if (keyName.prefix === RedisStoreKeyActionEnum.LOGIN && keyName.suffix === 'session') {
      logoutRequestHandler(keyName.key);
    }
  });
}

/**
 * Redis에 저장된 데이터를 조회하는 메서드
 * @param keyAction - Redis에 저장된 타입 ['LOGIN', 'REFRESH', 'BLACKLIST']
 * @param key - 찾으려는 정보의 key
 */
export const getDataToRedis = async (keyAction: RedisStoreKeyActionEnum, key: string): Promise<Result> => {
  const keyName = createKeyName(keyAction, key);
  const result:Result = { success: false, data: null };

  try {
    const redisResult = await redisClient.get(keyName);
    if (!redisResult) return result;

    // redis에서 데이터 조회에 성공한 경우
    result.success = true;
    result.data = JSON.parse(redisResult);

    return result;
  } catch (error) {
    console.log("Redis 조회 실패 (서버에러, status: 500)");
    result.error = error instanceof Error ? error.message : String(error);
    return result;
  }
}

/**
 * Redis에 데이터를 저장하는 메서드 (호이스팅이 되지 않는 메서드)
 * @param keyAction - Redis에 저장할 타입 ['LOGIN', 'BLACKLIST', 'REFRESH']
 * @param key - Redis에 저장할 key 이름
 * @param data - Redis에 저장한 data
 * @param ttlTime - Redis 저장 데이터 만료 시간
 */
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

/**
 * Redis의 데이터 삭제
 * @param keyAction - Redis에 저장된 타입 ['LOGIN', 'BLACKLIST', 'REFRESH']
 * @param key - Redis에서 찾을 정보의 Key
 */
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