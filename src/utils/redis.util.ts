/**
 * redis.util.ts
 */

import { RedisStoreKeyActionEnum } from "@utils/enum";

/**
 * Key 이름을 조합하는 메서드
 * @param keyAction - RedisStoreKeyActionEnum['LOGIN', 'REFRESH', 'BLACKLIST']
 * @param key - 유니크한 Redis key
 */
export const createKeyName = (keyAction: RedisStoreKeyActionEnum, key: string) => {
  let keyName = `${keyAction}:${key}`;
  // key Action이 로그아웃인 경우 뒤에 ':session' 추가
  if (keyAction === RedisStoreKeyActionEnum.LOGIN) {
    keyName += ':session';
  }

  return keyName;
}

/**
 * Redis의 저장된 KeyName을 분리하는 메서드
 * @param keyName
 */
export const getKeyName = (keyName: string) => {
  // keyName을 구조분해 할당. suffix가 없는 경우 null을 기본값으로 설정
  const [ prefix, key, suffix = null ] = keyName.split(':');

  return { prefix, key, suffix };
}