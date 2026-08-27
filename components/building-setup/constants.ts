import type { BuildingConfig } from "./types";

/**
 * 층수 선택 범위.
 * 근거는 docs/decisions/floor-numbering.md에 있다.
 */
export const MIN_TOP_FLOOR = 2;
export const MAX_TOP_FLOOR = 200;
export const MIN_BOTTOM_FLOOR = 0;
export const MAX_BOTTOM_FLOOR = 20;

/**
 * 엘리베이터 대수 선택 범위.
 * 근거는 docs/specs/multi-elevator-dispatch/spec.md에 있다.
 */
export const MIN_ELEVATOR_COUNT = 1;
export const MAX_ELEVATOR_COUNT = 6;

/** 저장된 설정이 없을 때 보여주는 기본값. 대수는 1대(single-elevator-round-trip과 동일)로 시작한다. */
export const DEFAULT_BUILDING_CONFIG: BuildingConfig = {
  topFloor: 10,
  bottomFloor: 0,
  elevatorCount: MIN_ELEVATOR_COUNT,
  theme: "modern",
  language: "ko",
};
