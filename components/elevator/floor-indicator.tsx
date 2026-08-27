import { ArrowDown, ArrowUp } from "lucide-react";

import { cn } from "@/lib/utils";

import { formatFloorWord } from "./floor-format";
import { getThemePalette, type ElevatorTheme } from "./theme";
import { SevenSegmentDisplay } from "./seven-segment-display";
import type { Direction } from "./types";

interface FloorIndicatorProps {
  floor: number;
  direction: Direction | null;
  theme: ElevatorTheme;
  className?: string;
}

/**
 * 로비·캐빈 양쪽에서 함께 쓰는 층 표시기. 카가 지금 있는 층을 실제
 * 엘리베이터의 7세그먼트 디스플레이처럼 보여준다.
 *
 * 지하는 "B" + 숫자를 통째로 세그먼트로 그린다(seven-segment-display.tsx
 * 참고). B는 소문자 b 모양으로 그려지지만 실제 엘리베이터 표시 관행과 같다.
 */
export function FloorIndicator({ floor, direction, theme, className }: FloorIndicatorProps) {
  const palette = getThemePalette(theme);
  const isBasement = floor < 0;
  const digits = isBasement ? `B${-floor}` : String(floor).padStart(2, " ");
  const floorWord = formatFloorWord(floor);

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 shadow-[inset_0_2px_6px_rgba(0,0,0,0.7),0_1px_0_rgba(255,255,255,0.08)]",
        palette.indicatorContainer,
        palette.indicatorText,
        className
      )}
      role="status"
      aria-label={`현재 층 ${floorWord}${direction ? (direction === "up" ? ", 올라가는 중" : ", 내려가는 중") : ""}`}
    >
      <span className="w-4 shrink-0" aria-hidden>
        {direction === "up" && <ArrowUp className="size-4 animate-pulse" />}
        {direction === "down" && <ArrowDown className="size-4 animate-pulse" />}
      </span>
      <SevenSegmentDisplay text={digits} className="[filter:drop-shadow(0_0_5px_currentColor)]" />
    </div>
  );
}
