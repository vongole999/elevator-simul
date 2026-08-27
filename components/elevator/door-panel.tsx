import { cn } from "@/lib/utils";

import { DOOR_ANIMATION_MS } from "./constants";
import { LobbyBackdrop } from "./lobby-backdrop";
import { Rider } from "./rider";
import { getThemePalette, type ElevatorTheme, type ThemePalette } from "./theme";

interface DoorPanelProps {
  open: boolean;
  theme: ElevatorTheme;
  /** 문 뒤로 무엇이 보여야 하는지: 로비에서 보면 복도, 캐빈 안에서 보면 내부. */
  scene: "lobby" | "cabin";
  /** LobbyBackdrop의 층별 변주 시드(scene이 "lobby"일 때만 쓴다). */
  floor?: number;
  /** 문 앞에 탑승객을 보여줄지(scene이 "lobby"일 때만 의미가 있다). */
  riderVisible?: boolean;
  className?: string;
}

/**
 * 문이 열렸을 때 캐빈 안쪽에서 보이는 벽. 분위기마다 재질과 장식을 다르게 그린다.
 *
 * 색상·텍스처처럼 순수 데이터로 뽑을 수 있는 값은 theme.ts의 팔레트에 있지만,
 * 여기 장식은 테마마다 그리는 그림의 구조 자체(엘리먼트 개수·배치)가 달라
 * 데이터화하지 않고 그대로 분기로 둔다(theme.ts 상단 설계 원칙). 새 테마를
 * 추가할 때는 이 분기와 아래 DoorPanel의 좌우 문짝 장식 분기를 함께 챙긴다.
 */
function CabinBackdrop({ theme, palette }: { theme: ElevatorTheme; palette: ThemePalette }) {
  return (
    <div
      className="absolute inset-0"
      style={{
        background: `linear-gradient(180deg, ${palette.sceneWallFrom} 0%, ${palette.sceneWallTo} 100%)`,
      }}
    >
      {theme === "modern" && (
        <>
          <div
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, rgba(255,255,255,0.5) 0 1px, transparent 1px 8px)",
            }}
          />
          {[20, 50, 80].map((left) => (
            <div
              key={left}
              className="absolute top-[6%] size-[7%] rounded-full"
              style={{ left: `${left}%`, background: "radial-gradient(circle, #fff9ec, transparent 70%)" }}
            />
          ))}
        </>
      )}

      {theme === "classic" && (
        <>
          <div
            className="absolute inset-0 opacity-70"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, rgba(0,0,0,0.12) 0 2px, transparent 2px 26px)",
            }}
          />
          <div
            className="absolute inset-x-[8%] top-[10%] h-[2px]"
            style={{ background: palette.frameTrim, opacity: 0.8 }}
          />
          <div
            className="absolute inset-x-[8%] bottom-[14%] h-[2px]"
            style={{ background: palette.frameTrim, opacity: 0.8 }}
          />
          <div
            className="absolute top-[20%] left-[14%] h-[16%] w-[3%] rounded-full"
            style={{ background: `linear-gradient(180deg, ${palette.frameTrim}, transparent)` }}
          />
          <div
            className="absolute top-[20%] right-[14%] h-[16%] w-[3%] rounded-full"
            style={{ background: `linear-gradient(180deg, ${palette.frameTrim}, transparent)` }}
          />
        </>
      )}

      {theme === "spaceship" && (
        <>
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(34,211,238,0.15) 0 1px, transparent 1px 10px)",
            }}
          />
          <div
            className="absolute inset-x-[15%] top-[8%] h-[1.5px] opacity-80"
            style={{ background: palette.frameTrim, boxShadow: `0 0 6px ${palette.frameTrim}` }}
          />
          <div
            className="absolute top-[35%] right-[10%] h-[10%] w-[16%] rounded-sm border opacity-80"
            style={{ borderColor: palette.frameTrim }}
          />
        </>
      )}

      <div
        className="absolute inset-x-[18%] top-[58%] h-2 rounded-full bg-black/40 shadow-[0_1px_0_rgba(255,255,255,0.15)]"
        aria-hidden
      />
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
 * 로비 복도나 캐빈 내부가 드러나게 한다. 문 표면 장식도 분위기마다
 * 달라, 색만 바뀌던 이전 버전과 달리 모던·클래식·우주선이 뚜렷이
 * 다른 문처럼 보인다.
 */
export function DoorPanel({ open, theme, scene, floor = 1, riderVisible = false, className }: DoorPanelProps) {
  const palette = getThemePalette(theme);
  const transitionStyle = { transitionDuration: `${DOOR_ANIMATION_MS}ms` };
  const doorSurface = {
    backgroundImage: [
      `linear-gradient(100deg, transparent 0%, ${palette.doorHighlight} 45%, transparent 60%)`,
      palette.doorTexture,
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
        {scene === "lobby" ? (
          <LobbyBackdrop theme={theme} floor={floor} />
        ) : (
          <CabinBackdrop theme={theme} palette={palette} />
        )}
      </div>

      {scene === "lobby" && <Rider visible={riderVisible} color={palette.riderColor} />}

      <div
        className="absolute inset-y-0 left-0 w-1/2 border-r border-black/30 shadow-[2px_0_6px_rgba(0,0,0,0.4)] transition-transform ease-in-out"
        style={{ ...transitionStyle, ...doorSurface, transform: open ? "translateX(-101%)" : "translateX(0)" }}
      >
        {theme === "classic" && (
          <div
            className="absolute inset-y-[10%] right-[10%] w-[6%] rounded-full"
            style={{ background: palette.frameTrim, opacity: 0.75 }}
          />
        )}
        {theme === "spaceship" && (
          <div
            className="absolute inset-y-[15%] right-0 w-[3px]"
            style={{ background: palette.frameTrim, boxShadow: `0 0 8px ${palette.frameTrim}` }}
          />
        )}
      </div>
      <div
        className="absolute inset-y-0 right-0 w-1/2 border-l border-black/30 shadow-[-2px_0_6px_rgba(0,0,0,0.4)] transition-transform ease-in-out"
        style={{
          ...transitionStyle,
          ...doorSurface,
          backgroundPosition: "right",
          transform: open ? "translateX(101%)" : "translateX(0)",
        }}
      >
        {theme === "classic" && (
          <div
            className="absolute inset-y-[10%] left-[10%] w-[6%] rounded-full"
            style={{ background: palette.frameTrim, opacity: 0.75 }}
          />
        )}
        {theme === "spaceship" && (
          <div
            className="absolute inset-y-[15%] left-0 w-[3px]"
            style={{ background: palette.frameTrim, boxShadow: `0 0 8px ${palette.frameTrim}` }}
          />
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_0_18px_rgba(0,0,0,0.65)]" />
    </div>
  );
}
