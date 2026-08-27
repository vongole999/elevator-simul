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
 * 지하는 세그먼트 폰트로 그리면 소문자 b로만 보여(seven-segment-display.tsx
 * 참고) "B"가 대문자로 읽히지 않으므로, B는 일반 글자로 따로 그리고
 * 세그먼트에는 숫자만 태운다.
 */
export function FloorIndicator({ floor, direction, theme, className }: FloorIndicatorProps) {
  const palette = getThemePalette(theme);
  const isBasement = floor < 0;
  const digits = isBasement ? String(-floor) : String(floor);
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
      {isBasement && (
        <span
          className="font-mono text-xl leading-none font-bold [filter:drop-shadow(0_0_5px_currentColor)]"
          aria-hidden
        >
          B
        </span>
      )}
      <SevenSegmentDisplay
        text={isBasement ? digits : digits.padStart(2, " ")}
        className="[filter:drop-shadow(0_0_5px_currentColor)]"
      />
    </div>
  );
}
