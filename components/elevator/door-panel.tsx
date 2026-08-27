import { cn } from "@/lib/utils";

import { DOOR_ANIMATION_MS } from "./constants";
import { getThemePalette, type ElevatorTheme, type ThemePalette } from "./theme";

interface DoorPanelProps {
  open: boolean;
  theme: ElevatorTheme;
  /** 문 뒤로 무엇이 보여야 하는지: 로비에서 보면 복도, 캐빈 안에서 보면 내부. */
  scene: "lobby" | "cabin";
  className?: string;
}

/** 문이 열렸을 때 보이는 로비 복도. 원근감 있는 바닥과 천장 조명으로 "바깥"임을 드러낸다. */
function LobbyBackdrop({ palette }: { palette: ThemePalette }) {
  return (
    <div
      className="absolute inset-0"
      style={{
        background: `linear-gradient(180deg, ${palette.sceneWallFrom} 0%, ${palette.sceneWallTo} 65%)`,
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-[18%] opacity-70"
        style={{
          background: `radial-gradient(ellipse 70% 100% at 50% 0%, ${palette.sceneAccent}55, transparent 75%)`,
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[38%]"
        style={{
          background: palette.sceneFloor,
          clipPath: "polygon(32% 0%, 68% 0%, 100% 100%, 0% 100%)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[38%] opacity-40"
        style={{
          background: "repeating-linear-gradient(90deg, transparent 0 9%, rgba(255,255,255,0.12) 9% calc(9% + 1px))",
          clipPath: "polygon(32% 0%, 68% 0%, 100% 100%, 0% 100%)",
        }}
      />
    </div>
  );
}

/** 문이 열렸을 때 캐빈 안쪽에서 보이는 벽. 브러시드 메탈 줄무늬와 천장 조명, 손잡이 바로 "내부"임을 드러낸다. */
function CabinBackdrop({ palette }: { palette: ThemePalette }) {
  return (
    <div
      className="absolute inset-0"
      style={{
        background: `linear-gradient(180deg, ${palette.sceneWallFrom} 0%, ${palette.sceneWallTo} 100%)`,
      }}
    >
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.07) 0 1px, transparent 1px 7px)",
        }}
      />
      <div
        className="absolute inset-x-[18%] top-0 h-[9%] rounded-b-lg opacity-80"
        style={{
          background: `linear-gradient(180deg, ${palette.sceneAccent}aa, transparent)`,
        }}
      />
      <div className="absolute inset-x-[12%] top-[58%] h-2 rounded-full bg-black/40 shadow-[0_1px_0_rgba(255,255,255,0.15)]" />
    </div>
  );
}

/**
 * 좌우로 갈라져 열리는 엘리베이터 문.
 *
 * open 값 하나만으로 구동한다. 이동 중 open이 반대로 뒤집히면 CSS
 * transition이 지금 위치에서 그대로 반대 방향으로 이어서 움직이므로,
 * "닫히던 문이 다시 열리는" 동작이 별도 처리 없이 자연스럽게 나온다.
 * 문 뒤에는 scene에 맞는 배경을 그려, 열렸을 때 그냥 까맣게 보이지 않고
 * 로비 복도나 캐빈 내부가 드러나게 한다.
 */
export function DoorPanel({ open, theme, scene, className }: DoorPanelProps) {
  const palette = getThemePalette(theme);
  const transitionStyle = { transitionDuration: `${DOOR_ANIMATION_MS}ms` };
  const doorSurface = {
    backgroundImage: [
      `linear-gradient(100deg, transparent 0%, ${palette.doorHighlight} 45%, transparent 60%)`,
      "repeating-linear-gradient(90deg, rgba(255,255,255,0.12) 0 1px, transparent 1px 5px)",
      `linear-gradient(135deg, ${palette.doorColorFrom}, ${palette.doorColorTo})`,
    ].join(", "),
  };

  return (
    <div
      className={cn(
        "relative aspect-[4/5] w-full overflow-hidden rounded-2xl",
        palette.frameRing,
        className
      )}
      role="img"
      aria-label={open ? "문이 열려 있습니다" : "문이 닫혀 있습니다"}
    >
      <div className="absolute inset-0">
        {scene === "lobby" ? <LobbyBackdrop palette={palette} /> : <CabinBackdrop palette={palette} />}
      </div>

      <div
        className="absolute inset-y-0 left-0 w-1/2 border-r border-black/30 shadow-[2px_0_6px_rgba(0,0,0,0.4)] transition-transform ease-in-out"
        style={{ ...transitionStyle, ...doorSurface, transform: open ? "translateX(-101%)" : "translateX(0)" }}
      />
      <div
        className="absolute inset-y-0 right-0 w-1/2 border-l border-black/30 shadow-[-2px_0_6px_rgba(0,0,0,0.4)] transition-transform ease-in-out"
        style={{
          ...transitionStyle,
          ...doorSurface,
          backgroundPosition: "right",
          transform: open ? "translateX(101%)" : "translateX(0)",
        }}
      />

      <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_0_18px_rgba(0,0,0,0.65)]" />
    </div>
  );
}
