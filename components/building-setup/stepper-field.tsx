"use client";

import { Minus, Plus } from "lucide-react";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

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
        <HoldableStepButton
          direction={-1}
          value={value}
          min={min}
          max={max}
          onChange={onChange}
          aria-label={`${label} 줄이기`}
        >
          <Minus className="size-4" />
        </HoldableStepButton>
        <span className="w-16 text-center font-mono text-2xl font-bold tabular-nums">{value}</span>
        <HoldableStepButton
          direction={1}
          value={value}
          min={min}
          max={max}
          onChange={onChange}
          aria-label={`${label} 늘리기`}
        >
          <Plus className="size-4" />
        </HoldableStepButton>
      </div>
    </div>
  );
}

/** 버튼을 누른 채 있을 때 첫 반복까지 기다리는 시간(ms). */
const HOLD_START_DELAY_MS = 450;
/** 반복이 빨라지다 멈추는 하한 간격(ms). */
const HOLD_MIN_INTERVAL_MS = 40;
/** 반복 한 번마다 다음 간격을 줄이는 비율. 값이 작을수록 더 빨리 가속된다. */
const HOLD_ACCELERATION = 0.8;

interface HoldableStepButtonProps {
  direction: 1 | -1;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  "aria-label": string;
  children: ReactNode;
}

/**
 * 누르고 있으면 가속 반복되는 +/- 버튼 하나.
 *
 * 짧게 클릭하면 한 단위만 바뀐다. 누른 채로 있으면 HOLD_START_DELAY_MS
 * 뒤부터 자동으로 반복되며 점점 빨라진다 — 지상 200층처럼 넓어진 범위도
 * 최댓값까지 여러 번 클릭하지 않고 누르고 있는 것만으로 도달하게 하기
 * 위해서다. 반복이 한 번이라도 일어난 뒤에 뒤이어 발생하는 click은
 * 무시해, 뗄 때 한 단위가 더 바뀌는 중복을 막는다.
 */
function HoldableStepButton({
  direction,
  value,
  min,
  max,
  onChange,
  children,
  ...labelProps
}: HoldableStepButtonProps) {
  // setTimeout 콜백이 항상 최신 값을 보도록 ref로 들고 있는다(클로저가 오래된 값을 붙잡지 않게).
  const valueRef = useRef(value);
  valueRef.current = value;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heldRef = useRef(false);

  useEffect(() => () => clearHold(), []);

  function clearHold() {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  function step(): boolean {
    const next = valueRef.current + direction;
    if (next < min || next > max) return false;
    onChange(next);
    return true;
  }

  function scheduleNext(intervalMs: number) {
    timeoutRef.current = setTimeout(() => {
      heldRef.current = true;
      if (step()) {
        scheduleNext(Math.max(HOLD_MIN_INTERVAL_MS, intervalMs * HOLD_ACCELERATION));
      } else {
        clearHold();
      }
    }, intervalMs);
  }

  const disabled = direction < 0 ? value <= min : value >= max;

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      disabled={disabled}
      onPointerDown={() => {
        heldRef.current = false;
        scheduleNext(HOLD_START_DELAY_MS);
      }}
      onPointerUp={clearHold}
      onPointerLeave={clearHold}
      onPointerCancel={clearHold}
      onClick={() => {
        if (heldRef.current) {
          heldRef.current = false;
          return;
        }
        step();
      }}
      {...labelProps}
    >
      {children}
    </Button>
  );
}
