import type { ElevatorTheme } from "@/components/elevator/theme";

/** 안내 언어. 이번 스펙에서는 실제 안내 음성은 한국어로 고정이고, 값만 저장한다. */
export type Language = "ko" | "en";

/** 아이가 설정 화면에서 만드는 건물. */
export interface BuildingConfig {
  /** 지상 층수. */
  topFloor: number;
  /** 지하 층수(0이면 지하 없음). */
  bottomFloor: number;
  /** 엘리베이터 대수(1~4대). */
  elevatorCount: number;
  theme: ElevatorTheme;
  language: Language;
}
