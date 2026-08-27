/**
 * 엘리베이터 인테리어 분위기.
 *
 * 종류와 근거는 docs/specs/building-setup/spec.md를 따른다. 색상만 여기
 * 데이터로 갖고, 문·버튼·배경의 "모양(shape)" 차이는 그 모양을 그리는
 * 컴포넌트(panel-button.tsx, door-panel.tsx, lobby-backdrop.tsx 등)가 이
 * theme 값을 직접 보고 결정한다 — 분위기라는 하나의 개념이 여러 시각
 * 요소에 걸쳐 있어도, 각 요소의 생김새는 그걸 그리는 컴포넌트의 책임으로
 * 남긴다("미룬 것" 항목이던 정확한 배색·모양은 이 파일과 각 컴포넌트에서
 * 자유롭게 정한다).
 *
 * 색상은 다중 그라데이션을 겹쳐 재질감을 내야 해서 실제 색상값(hex)으로,
 * 표시기 등 일부는 tailwind 유틸리티 클래스로 갖고 있다.
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
  /** 문 표면에 겹치는 미세 텍스처 패턴(반복 그라데이션 CSS 값). 재질감을 낸다. */
  doorTexture: string;
  /** 문 주변 프레임(벽면) 재질 그라데이션. 층 표시기·레이블이 얹히는 배경이다. */
  frameWallFrom: string;
  frameWallTo: string;
  /** 프레임의 몰딩·솔기 장식 색(클래식은 금색 몰딩, 스페이스십은 네온 라인 등). */
  frameTrim: string;
  /** 문 뒤 장면(로비 복도 또는 캐빈 내부) 벽 그라데이션. */
  sceneWallFrom: string;
  sceneWallTo: string;
  /** 로비 바닥 색. */
  sceneFloor: string;
  /** 천장 조명·네온 포인트 색. 버튼 점등 글로우에도 함께 쓴다. */
  sceneAccent: string;
  /** 로비 창밖 풍경의 바탕색(층에 따라 밝기를 보정해 쓴다). */
  skyFrom: string;
  skyTo: string;
  /** 층 표시기 배경(tailwind 클래스). */
  indicatorContainer: string;
  /** 층 표시기 숫자 색(tailwind 클래스, 세그먼트가 currentColor로 물려받는다). */
  indicatorText: string;
  /** 카 레이블(A/B/C/D) 배지의 tailwind 클래스. */
  labelBadgeClass: string;
  /** 타고 내리는 탑승객 실루엣 색. */
  riderColor: string;
}

const THEME_PALETTES: Record<ElevatorTheme, ThemePalette> = {
  modern: {
    frameRing: "ring-1 ring-neutral-300",
    doorColorFrom: "#d4d4d4",
    doorColorTo: "#8a8a8a",
    doorHighlight: "rgba(255,255,255,0.55)",
    doorTexture: "repeating-linear-gradient(90deg, rgba(255,255,255,0.12) 0 1px, transparent 1px 5px)",
    frameWallFrom: "#eef1f4",
    frameWallTo: "#c7cad0",
    frameTrim: "#94a3b8",
    sceneWallFrom: "#eef1f4",
    sceneWallTo: "#d7dbe0",
    sceneFloor: "#b9bfc7",
    sceneAccent: "#38bdf8",
    skyFrom: "#cdeaff",
    skyTo: "#f3fbff",
    indicatorContainer: "bg-neutral-900 ring-1 ring-neutral-700",
    indicatorText: "text-sky-400",
    labelBadgeClass: "bg-white text-slate-700 ring-1 ring-slate-300 rounded-md",
    riderColor: "#475569",
  },
  classic: {
    frameRing: "ring-1 ring-amber-900/60",
    doorColorFrom: "#caa15a",
    doorColorTo: "#7a5222",
    doorHighlight: "rgba(255,238,196,0.6)",
    doorTexture: "repeating-linear-gradient(90deg, rgba(0,0,0,0.15) 0 2px, transparent 2px 18px)",
    frameWallFrom: "#8a6136",
    frameWallTo: "#4a331c",
    frameTrim: "#f0c96b",
    sceneWallFrom: "#8a6136",
    sceneWallTo: "#5c4023",
    sceneFloor: "#8a3a3a",
    sceneAccent: "#ffd27a",
    skyFrom: "#7a5230",
    skyTo: "#3a2614",
    indicatorContainer: "bg-stone-900 ring-1 ring-amber-800/60",
    indicatorText: "text-yellow-400",
    labelBadgeClass: "bg-[radial-gradient(circle_at_35%_28%,#ffe9b0,#d4a94a_60%,#8a5f1f_100%)] text-amber-950 ring-1 ring-amber-200/60 rounded-full",
    riderColor: "#4a3320",
  },
  spaceship: {
    frameRing: "ring-1 ring-cyan-400/40",
    doorColorFrom: "#7c8aa0",
    doorColorTo: "#333d4d",
    doorHighlight: "rgba(165,243,252,0.65)",
    doorTexture: "repeating-linear-gradient(0deg, rgba(165,243,252,0.16) 0 1px, transparent 1px 6px)",
    frameWallFrom: "#2d3b52",
    frameWallTo: "#121a2b",
    frameTrim: "#22d3ee",
    sceneWallFrom: "#26344a",
    sceneWallTo: "#101826",
    sceneFloor: "#16233a",
    sceneAccent: "#22d3ee",
    skyFrom: "#1c2c46",
    skyTo: "#0a1120",
    indicatorContainer: "bg-slate-900 ring-1 ring-cyan-500/40",
    indicatorText: "text-cyan-400",
    labelBadgeClass: "bg-slate-900 text-cyan-300 ring-1 ring-cyan-400/70 [clip-path:polygon(15%_0,85%_0,100%_50%,85%_100%,15%_100%,0_50%)] px-1",
    riderColor: "#7dd3fc",
  },
};

export function getThemePalette(theme: ElevatorTheme): ThemePalette {
  return THEME_PALETTES[theme];
}
