import { ArrowDown, ArrowUp } from "lucide-react";

import { cn } from "@/lib/utils";

import type { Direction } from "./types";

interface FloorIndicatorProps {
  floor: number;
  direction: Direction | null;
  className?: string;
}

/** 로비·캐빈 양쪽에서 함께 쓰는 층 표시기. 카가 지금 있는 층을 보여준다. */
export function FloorIndicator({ floor, direction, className }: FloorIndicatorProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 text-amber-400 ring-1 ring-neutral-700",
        className
      )}
      role="status"
      aria-label={`현재 층 ${floor}층${direction ? (direction === "up" ? ", 올라가는 중" : ", 내려가는 중") : ""}`}
    >
      <span className="w-5" aria-hidden>
        {direction === "up" && <ArrowUp className="size-5 animate-pulse" />}
        {direction === "down" && <ArrowDown className="size-5 animate-pulse" />}
      </span>
      <span className="font-mono text-3xl font-bold tabular-nums">{floor}</span>
    </div>
  );
}
