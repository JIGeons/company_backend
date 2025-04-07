/**
 * Redis 연결 및 이벤트 처리 구독 설정 파일
 */

import { createClient } from 'redis';
import { REDIS_URI } from "@config/index";
import {logoutHandler} from "@/listeners/logout.handler";

// 일반 명령용 클라이언트
export const redisClient = createClient({ url: REDIS_URI });

// pub/sub 이벤트 감지용 클라이언트
export const redisSubscriber = createClient({ url: REDIS_URI });

export async function initializeRedis() {
  // 명령용 클라이언트 연결
  await redisClient.connect()
    .then(() => {console.log("✅ Redis 명령용 연결 완료")})
    .catch(error => {console.error("❌ Redis 명령용 연결 실패: ", error);});

  // pub/sub용 클라이언트 연결
  await redisSubscriber.connect()
    .then(() => {console.log("✅ Redis 이벤트용 연결 완료")})
    .catch(error => {console.error("❌ Redis 이벤트용 연결 실패: ", error);});

  // TTL 이벤트 수신을 위한 notify 설정 (redis 전체 설정)
  await redisClient.configSet('notify-keyspace-events', 'Ex');  // TTL 이벤트 구독
  console.log('✅ Redis 연결 및 이벤트 설정 완료');

  // 구독 시작: Redis 에서 TTL(Time-To-Live)이 만료되어 자동으로 삭제될 때 발생하는 이벤트
  await redisSubscriber.pSubscribe('__keyevent@0__:expired', (message) => {
    console.log('🕓 TTL 만료 감지: ', message);

    if (message.startsWith('accessToken:') && message.endsWith(':session')) {
      const accessToken = message.split(':')[1];
      logoutHandler(accessToken); // 로그아웃 처리
    }
  });

  console.log('💡 Redis expired 이벤트 구독 시작');
}