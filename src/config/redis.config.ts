/**
 * Redis 연결 및 이벤트 처리 구독 설정 파일
 */

import {createClient} from 'redis';
import {REDIS_URI} from "@config/index";

// Service
import { redisTTLEventHandler } from "@services/redis.service";

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