import { cn } from "@/lib/utils";

import { DOOR_ANIMATION_MS } from "./constants";

interface DoorPanelProps {
  open: boolean;
  className?: string;
}

/**
 * 좌우로 갈라져 열리는 엘리베이터 문.
 *
 * open 값 하나만으로 구동한다. 이동 중 open이 반대로 뒤집히면 CSS
 * transition이 지금 위치에서 그대로 반대 방향으로 이어서 움직이므로,
 * "닫히던 문이 다시 열리는" 동작이 별도 처리 없이 자연스럽게 나온다.
 */
export function DoorPanel({ open, className }: DoorPanelProps) {
  const transitionStyle = { transitionDuration: `${DOOR_ANIMATION_MS}ms` };

  return (
    <div
      className={cn(
        "relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-neutral-950 ring-1 ring-neutral-800",
        className
      )}
      role="img"
      aria-label={open ? "문이 열려 있습니다" : "문이 닫혀 있습니다"}
    >
      <div
        className="absolute inset-y-0 left-0 w-1/2 border-r border-neutral-500/40 bg-gradient-to-r from-neutral-300 to-neutral-400 transition-transform ease-in-out"
        style={{ ...transitionStyle, transform: open ? "translateX(-100%)" : "translateX(0)" }}
      />
      <div
        className="absolute inset-y-0 right-0 w-1/2 border-l border-neutral-500/40 bg-gradient-to-l from-neutral-300 to-neutral-400 transition-transform ease-in-out"
        style={{ ...transitionStyle, transform: open ? "translateX(100%)" : "translateX(0)" }}
      />
    </div>
  );
}
