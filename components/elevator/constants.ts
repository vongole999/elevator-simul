/**
 * 건물·이동 관련 상수.
 *
 * 값의 근거는 docs/specs/single-elevator-round-trip/spec.md의
 * "정해진 제약과 이유"·"가정" 절을 따른다.
 */

/** 지상 층수(지하 없음). */
export const TOP_FLOOR = 10;

/** 최하층. 이 건물은 지하가 없으므로 1층이 곧 최하층이다. */
export const BOTTOM_FLOOR = 1;

/** 아이와 엘리베이터가 함께 시작하는 층. */
export const START_FLOOR = 1;

/**
 * 층당 이동 시간(ms).
 * PRODUCT.md 기준 "지상 50층까지 30초"에서 뽑은 0.6초/층이다.
 */
export const FLOOR_TRAVEL_MS = 600;

/**
 * 문이 열린 채로 대기하는 시간(ms).
 * spec.md 가정: "문이 열린 채 기다리는 시간은 4초 안팎".
 * 승차 대기, 목적층 선택 후 자동 닫힘 대기, 하차 대기에 공통으로 쓴다.
 */
export const DOORS_OPEN_WAIT_MS = 4000;

/**
 * 문이 여닫히는 애니메이션 자체의 소요 시간(ms).
 * spec.md에 수치가 없어 자유롭게 정한 값이다. 문 열림/닫힘 버튼의 CSS
 * transition 시간과 반드시 같은 값을 써야 "닫히던 문이 다시 열린다"는
 * 수용 기준이 어색하지 않게 보인다.
 */
export const DOOR_ANIMATION_MS = 900;
