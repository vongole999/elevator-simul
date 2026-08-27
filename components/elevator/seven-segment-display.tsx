import { cn } from "@/lib/utils";

/** 세그먼트 하나의 사각형 좌표. viewBox "0 0 30 54" 기준. */
const SEGMENT_RECTS: Record<string, { x: number; y: number; width: number; height: number }> = {
  a: { x: 6, y: 0, width: 18, height: 6 },
  b: { x: 24, y: 6, width: 6, height: 18 },
  c: { x: 24, y: 30, width: 6, height: 18 },
  d: { x: 6, y: 48, width: 18, height: 6 },
  e: { x: 0, y: 30, width: 6, height: 18 },
  f: { x: 0, y: 6, width: 6, height: 18 },
  g: { x: 6, y: 24, width: 18, height: 6 },
};

/**
 * 문자마다 켜야 할 세그먼트. 지하 표시 "B"는 7세그먼트로는 소문자 b
 * 모양(관행)으로만 그릴 수 있어 대문자로 읽히지 않으므로, 이 디스플레이에
 * 태우지 않고 FloorIndicator에서 별도 문자로 그린다.
 */
const CHAR_SEGMENTS: Record<string, string[]> = {
  "0": ["a", "b", "c", "d", "e", "f"],
  "1": ["b", "c"],
  "2": ["a", "b", "g", "e", "d"],
  "3": ["a", "b", "g", "c", "d"],
  "4": ["f", "g", "b", "c"],
  "5": ["a", "f", "g", "c", "d"],
  "6": ["a", "f", "g", "e", "c", "d"],
  "7": ["a", "b", "c"],
  "8": ["a", "b", "c", "d", "e", "f", "g"],
  "9": ["a", "b", "c", "d", "f", "g"],
  "-": ["g"],
  " ": [],
};

function SevenSegmentDigit({ char }: { char: string }) {
  const activeSegments = new Set(CHAR_SEGMENTS[char] ?? []);
  return (
    <svg viewBox="0 0 30 54" className="h-9 w-5 shrink-0">
      {Object.entries(SEGMENT_RECTS).map(([key, rect]) => (
        <rect
          key={key}
          x={rect.x}
          y={rect.y}
          width={rect.width}
          height={rect.height}
          rx={1.5}
          className={cn("fill-current", !activeSegments.has(key) && "opacity-[0.08]")}
        />
      ))}
    </svg>
  );
}

interface SevenSegmentDisplayProps {
  text: string;
  className?: string;
}

/**
 * 실제 엘리베이터 층 표시기처럼 보이는 7세그먼트 디스플레이.
 *
 * 부모 요소의 text color(currentColor)를 켜진 세그먼트 색으로 쓰고, 꺼진
 * 세그먼트는 같은 색을 아주 옅게 남겨 실제 디스플레이의 "잔상"을 흉내낸다.
 */
export function SevenSegmentDisplay({ text, className }: SevenSegmentDisplayProps) {
  return (
    <div className={cn("flex gap-0.5", className)}>
      {text.split("").map((char, index) => (
        <SevenSegmentDigit key={index} char={char} />
      ))}
    </div>
  );
}
