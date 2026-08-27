/**
 * 이동 관련 상수.
 *
 * 값의 근거는 docs/specs/single-elevator-round-trip/spec.md의
 * "정해진 제약과 이유"·"가정" 절을 따른다. 건물의 지상·지하 층수는
 * 더 이상 고정값이 아니라 building-setup에서 정한 값을 받는다.
 */

/** 아이와 엘리베이터가 항상 함께 시작하는 층. */
export const START_FLOOR = 1;

/**
 * 층당 이동 시간(ms).
 * PRODUCT.md 기준 "지상 50층까지 30초"(0.6초/층)에서 출발했으나, 실제로
 * 타보니 너무 빨라 체감이 안 된다는 피드백으로 느리게 조정했다.
 */
export const FLOOR_TRAVEL_MS = 900;

/**
 * 문이 열린 채로 대기하는 시간(ms).
 * spec.md 가정: "문이 열린 채 기다리는 시간은 4초 안팎".
 * 승차 대기, 목적층 선택 후 자동 닫힘 대기, 하차 대기에 공통으로 쓴다.
 */
export const DOORS_OPEN_WAIT_MS = 4000;

/**
 * 하차 후 로비에서 문이 저절로 닫히기까지 기다리는 시간(ms).
 * 승객이 이미 내린 뒤라 반응을 기다릴 필요가 없어 DOORS_OPEN_WAIT_MS보다 짧다.
 */
export const ALIGHTING_DOOR_WAIT_MS = 2000;

/**
 * 문이 여닫히는 애니메이션 자체의 소요 시간(ms).
 * spec.md에 수치가 없어 자유롭게 정한 값이다. 문 열림/닫힘 버튼의 CSS
 * transition 시간과 반드시 같은 값을 써야 "닫히던 문이 다시 열린다"는
 * 수용 기준이 어색하지 않게 보인다.
 */
export const DOOR_ANIMATION_MS = 900;

/**
 * 자율 운행 카가 idle 상태로 머무는 시간(ms)의 범위. 이 범위 안에서
 * 무작위로 골라 대기한 뒤 다음 목적층으로 출발한다.
 * docs/specs/multi-elevator-dispatch/spec.md 가정: "아이가 타는 차의 기존
 * 문 열림 대기(4초 안팎)와 비슷한 감각으로 잡는다".
 */
export const AUTO_IDLE_MIN_WAIT_MS = 3000;
export const AUTO_IDLE_MAX_WAIT_MS = 8000;

/**
 * 대수만큼의 카를 가리키는 레이블(최대 6대). 로비 화면과 캐빈 화면이
 * 같은 규칙으로 카를 가리켜야 해서 여기 한 곳에 둔다.
 */
export const CAR_LABELS = ["A", "B", "C", "D", "E", "F"];

/** 카 인덱스에 대응하는 레이블. 레이블 개수(6)를 넘는 인덱스는 1부터 시작하는 숫자로 대체한다. */
export function getCarLabel(index: number): string {
  return CAR_LABELS[index] ?? String(index + 1);
}
