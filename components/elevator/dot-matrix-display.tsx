import { cn } from "@/lib/utils";

/**
 * 문자마다 켜야 할 점의 5×7 격자 패턴(위→아래, 왼쪽→오른쪽, 1=켜짐).
 *
 * 7세그먼트로는 숫자만 정확히 그릴 수 있고 알파벳은 소문자 모양(예: B가
 * 8과 구분 안 되는 소문자 b)으로만 나와, 숫자와 B를 같은 방식으로
 * 그리지 못했다. 도트매트릭스는 실제 버스·지하철 안내판처럼 문자를
 * 점 격자로 그려 숫자·알파벳을 가리지 않고 원래 모양대로 표현할 수
 * 있으므로, B도 세로선이 곧고 오른쪽만 볼록한 실제 대문자 B 모양으로
 * 그려져 8(좌우 대칭)과 뚜렷이 구분된다.
 */
const DOT_PATTERNS: Record<string, string[]> = {
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "3": ["11111", "00010", "00100", "00010", "00001", "10001", "01110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
  "B": ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
};

const COLS = 5;
const ROWS = 7;
/** 점 하나가 차지하는 격자 칸 크기(SVG 유닛). */
const CELL = 6;
const DOT_RADIUS = 2.2;

function DotMatrixChar({ char }: { char: string }) {
  const pattern = DOT_PATTERNS[char] ?? DOT_PATTERNS[" "];
  return (
    <svg viewBox={`0 0 ${COLS * CELL} ${ROWS * CELL}`} className="h-9 w-[1.6rem] shrink-0">
      {pattern.flatMap((row, y) =>
        row.split("").map((bit, x) => (
          <circle
            key={`${x}-${y}`}
            cx={x * CELL + CELL / 2}
            cy={y * CELL + CELL / 2}
            r={DOT_RADIUS}
            className={cn("fill-current", bit === "0" && "opacity-[0.08]")}
          />
        ))
      )}
    </svg>
  );
}

interface DotMatrixDisplayProps {
  text: string;
  className?: string;
}

/**
 * 실제 버스·지하철 안내판처럼 보이는 점 격자(도트매트릭스) 디스플레이.
 *
 * 부모 요소의 text color(currentColor)를 켜진 점 색으로 쓰고, 꺼진 점은
 * 같은 색을 아주 옅게 남겨 실제 디스플레이의 "잔상"을 흉내낸다.
 */
export function DotMatrixDisplay({ text, className }: DotMatrixDisplayProps) {
  return (
    <div className={cn("flex gap-1", className)}>
      {text.split("").map((char, index) => (
        <DotMatrixChar key={index} char={char} />
      ))}
    </div>
  );
}
