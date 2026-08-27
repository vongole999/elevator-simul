import type { BuildingConfig } from "./types";

/**
 * 층수 선택 범위.
 * 근거는 docs/decisions/floor-numbering.md에 있다.
 */
export const MIN_TOP_FLOOR = 2;
export const MAX_TOP_FLOOR = 30;
export const MIN_BOTTOM_FLOOR = 0;
export const MAX_BOTTOM_FLOOR = 5;

/** 저장된 설정이 없을 때 보여주는 기본값. single-elevator-round-trip 스펙과 같다. */
export const DEFAULT_BUILDING_CONFIG: BuildingConfig = {
  topFloor: 10,
  bottomFloor: 0,
  theme: "modern",
  language: "ko",
};
