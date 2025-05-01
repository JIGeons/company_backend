/**
 * utils.ts
 */

/**
 * 인증 코드를 발생하는 메서드
 * @param length - 최소 6자리 이상 length가 없는 경우 default 8자리로 생성.
 */
export function generateVerificationCode(length: number = 8): string {
  if (length < 6) throw new Error("인증 코드는 최소 6자 이상부터 발급 가능합니다.");

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const specials = '!@#$%^&*+=?/';

  let result = '';

  // 특수 문자 1개 무조건 포함
  result += specials[Math.floor(Math.random() * specials.length)];

  // 나머지 문자 채우기
  for (let i = 1; i < length; i++) {
    const all = chars + specials;
    const randomIndex = Math.floor(Math.random() * all.length);
    result += all[randomIndex];
  }

  // 특수문자가 첫 번째에만 고정되지 않도록 셔플
  return shuffleString(result);
}

/**
 * 문자열을 랜덤하게 섞는 함수
 * @param str
 */
function shuffleString(str: string): string {
  const arr = str.split('');

  // 랜던하게 순서 재조합
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];  // swap
  }

  // 하나의 문자열로 반환
  return arr.join('');
}

/**
 * Date객체를 yyyy-MM-dd am/pm HH:mm:ss 형식으로 변환하는 메서드
 * @param dateTime
 */
export function formatDateToDateAMPM(dateTime: Date): string {
  const stringDate = dateTime.toISOString();
  const [date, time] = stringDate.split('T');
  const [hour, minute, second] = time.split(':');

  let numberHour = Number(hour);
  const ampm = numberHour < 12 ? 'am' : 'pm';
  if (numberHour != 12) { // 오후 12시를 제외한 나머지 시간은 12의 나머지로 사용한다.
    numberHour = numberHour % 12;
  }

  return `${date} ${ampm} ${String(numberHour).padStart(2, '0')}:${minute}:${second}`;
}