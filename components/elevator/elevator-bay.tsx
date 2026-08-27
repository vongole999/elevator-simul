import { cn } from "@/lib/utils";

import { DoorPanel } from "./door-panel";
import { FloorIndicator } from "./floor-indicator";
import { getThemePalette, type ElevatorTheme } from "./theme";
import type { Direction } from "./types";

interface ElevatorBayProps {
  theme: ElevatorTheme;
  open: boolean;
  scene: "lobby" | "cabin";
  /** 표시기에 보여줄, 카가 지금 있는 층. */
  carFloor: number;
  /** 문이 열렸을 때 보이는 로비 풍경의 층별 변주 시드. 이 문이 속한 로비 자체의 층(scene이 "lobby"일 때만 쓴다). */
  lobbyFloor?: number;
  direction: Direction | null;
  /** 이 카의 A/B/C/D 레이블. 없으면 배지를 그리지 않는다. */
  label?: string;
  riderVisible?: boolean;
  className?: string;
}

/**
 * 문 한 대를 감싸는 "엘리베이터 홀" 조합. 문만 화면에 덩그러니 떠 있지
 * 않도록 벽 재질 프레임으로 감싸고, 그 프레임 상단에 카 레이블과 층
 * 표시기를 문 옆에 나란히 얹는다. 로비·캐빈 두 화면이 함께 쓴다.
 */
export function ElevatorBay({
  theme,
  open,
  scene,
  carFloor,
  lobbyFloor,
  direction,
  label,
  riderVisible = false,
  className,
}: ElevatorBayProps) {
  const palette = getThemePalette(theme);

  return (
    <div
      className={cn("relative w-full rounded-[1.75rem] p-2.5", className)}
      style={{
        background: `linear-gradient(180deg, ${palette.frameWallFrom}, ${palette.frameWallTo})`,
        boxShadow: `inset 0 0 0 2px ${palette.frameTrim}55, 0 4px 14px rgba(0,0,0,0.18)`,
      }}
    >
      <div className="mb-2 flex items-center gap-2">
        {label && <CarLabelBadge label={label} theme={theme} />}
        <FloorIndicator
          floor={carFloor}
          direction={direction}
          theme={theme}
          className="ml-auto origin-right scale-90"
        />
      </div>

      <DoorPanel
        open={open}
        theme={theme}
        scene={scene}
        floor={lobbyFloor}
        riderVisible={riderVisible}
      />
    </div>
  );
}

/** 카 한 대를 가리키는 A/B/C/D 레이블 배지. 여러 대일 때 문의 자리가 아니라 글자로도 어느 차인지 바로 구분되게 한다. */
function CarLabelBadge({ label, theme }: { label: string; theme: ElevatorTheme }) {
  const palette = getThemePalette(theme);
  return (
    <span
      className={cn(
        "flex size-6 shrink-0 items-center justify-center text-xs font-bold",
        palette.labelBadgeClass
      )}
      aria-label={`${label}호기`}
    >
      {label}
    </span>
  );
}
