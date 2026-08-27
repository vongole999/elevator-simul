/**
 * 엘리베이터 인테리어 분위기.
 *
 * 종류와 근거는 docs/specs/building-setup/spec.md를 따른다. 문·표시기·
 * 문 뒤 장면의 색감만 바꾸고, 정확한 배색은 이 파일에서 자유롭게 정한다
 * ("미룬 것" 참고). 문·장면은 다중 그라데이션을 겹쳐 재질감을 내야 해서
 * 실제 색상값(hex)으로, 표시기는 tailwind 유틸리티 클래스로 갖고 있다.
 */
export const ELEVATOR_THEMES = ["modern", "classic", "spaceship"] as const;

export type ElevatorTheme = (typeof ELEVATOR_THEMES)[number];

export interface ThemePalette {
  /** 문틀 바깥 테두리(카드 배경과 맞닿는 곳). */
  frameRing: string;
  /** 문 표면 그라데이션과 얇은 세로 브러시 라인의 기본색. */
  doorColorFrom: string;
  doorColorTo: string;
  /** 문 표면의 대각선 하이라이트(광택). */
  doorHighlight: string;
  /** 문 뒤 장면(로비 복도 또는 캐빈 내부) 벽 그라데이션. */
  sceneWallFrom: string;
  sceneWallTo: string;
  /** 로비 바닥 색. */
  sceneFloor: string;
  /** 천장 조명·네온 포인트 색. */
  sceneAccent: string;
  /** 층 표시기 배경(tailwind 클래스). */
  indicatorContainer: string;
  /** 층 표시기 숫자 색(tailwind 클래스, 세그먼트가 currentColor로 물려받는다). */
  indicatorText: string;
}

const THEME_PALETTES: Record<ElevatorTheme, ThemePalette> = {
  modern: {
    frameRing: "ring-1 ring-neutral-800",
    doorColorFrom: "#d4d4d4",
    doorColorTo: "#8a8a8a",
    doorHighlight: "rgba(255,255,255,0.55)",
    sceneWallFrom: "#4b4b4f",
    sceneWallTo: "#1c1c1e",
    sceneFloor: "#2a2a2d",
    sceneAccent: "#f5deb3",
    indicatorContainer: "bg-neutral-900 ring-1 ring-neutral-700",
    indicatorText: "text-amber-400",
  },
  classic: {
    frameRing: "ring-1 ring-amber-900/60",
    doorColorFrom: "#caa15a",
    doorColorTo: "#7a5222",
    doorHighlight: "rgba(255,238,196,0.6)",
    sceneWallFrom: "#5c4326",
    sceneWallTo: "#241a10",
    sceneFloor: "#3a2a16",
    sceneAccent: "#ffd27a",
    indicatorContainer: "bg-stone-900 ring-1 ring-amber-800/60",
    indicatorText: "text-yellow-400",
  },
  spaceship: {
    frameRing: "ring-1 ring-cyan-500/30",
    doorColorFrom: "#7c8aa0",
    doorColorTo: "#333d4d",
    doorHighlight: "rgba(165,243,252,0.65)",
    sceneWallFrom: "#1e293b",
    sceneWallTo: "#04070d",
    sceneFloor: "#0b1220",
    sceneAccent: "#22d3ee",
    indicatorContainer: "bg-slate-900 ring-1 ring-cyan-500/40",
    indicatorText: "text-cyan-400",
  },
};

export function getThemePalette(theme: ElevatorTheme): ThemePalette {
  return THEME_PALETTES[theme];
}
