import { ArrowDown, ArrowUp } from "lucide-react";

import { cn } from "@/lib/utils";

import { DotMatrixDisplay } from "./dot-matrix-display";
import { formatFloorWord } from "./floor-format";
import { getThemePalette, type ElevatorTheme } from "./theme";
import type { Direction } from "./types";

interface FloorIndicatorProps {
  floor: number;
  direction: Direction | null;
  theme: ElevatorTheme;
  className?: string;
}

/**
 * 로비·캐빈 양쪽에서 함께 쓰는 층 표시기. 카가 지금 있는 층을 실제
 * 엘리베이터의 점 격자(도트매트릭스) 디스플레이처럼 보여준다.
 *
 * 지하는 "B" + 숫자를 통째로 같은 도트매트릭스로 그린다
 * (dot-matrix-display.tsx 참고). 점 격자는 세그먼트와 달리 대문자 B를
 * 8과 다른 모양(오른쪽만 볼록한 실제 B 모양) 그대로 그릴 수 있다.
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
      <DotMatrixDisplay text={digits} className="[filter:drop-shadow(0_0_5px_currentColor)]" />
    </div>
  );
}
