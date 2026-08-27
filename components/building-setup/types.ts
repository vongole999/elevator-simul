import type { ElevatorTheme } from "@/components/elevator/theme";
import type { Language } from "@/components/elevator/types";

export type { Language };

/** 아이가 설정 화면에서 만드는 건물. */
export interface BuildingConfig {
  /** 지상 층수. */
  topFloor: number;
  /** 지하 층수(0이면 지하 없음). */
  bottomFloor: number;
  /** 엘리베이터 대수(1~6대). */
  elevatorCount: number;
  theme: ElevatorTheme;
  language: Language;
}
