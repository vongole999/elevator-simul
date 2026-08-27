import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

interface StepperFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

/** 숫자 값을 +/- 버튼으로 한 단위씩 정하는 스테퍼. 층수·대수 등 값의 종류와 무관하게 쓴다. */
export function StepperField({ label, value, min, max, onChange }: StepperFieldProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          aria-label={`${label} 줄이기`}
        >
          <Minus className="size-4" />
        </Button>
        <span className="w-10 text-center font-mono text-2xl font-bold tabular-nums">
          {value}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          aria-label={`${label} 늘리기`}
        >
          <Plus className="size-4" />
        </Button>
      </div>
    </div>
  );
}
