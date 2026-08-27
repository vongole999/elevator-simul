import { DoorClosed, DoorOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { BOTTOM_FLOOR, TOP_FLOOR } from "./constants";
import { DoorPanel } from "./door-panel";
import { FloorIndicator } from "./floor-indicator";
import { isDoorsOpen } from "./machine";
import type { ElevatorState } from "./types";

interface CabinSceneProps {
  state: ElevatorState;
  onSelectFloor: (floor: number) => void;
  onPressOpenDoor: () => void;
  onPressCloseDoor: () => void;
}

const FLOOR_NUMBERS = Array.from(
  { length: TOP_FLOOR - BOTTOM_FLOOR + 1 },
  (_, i) => TOP_FLOOR - i
);

/** 엘리베이터 안에서 문을 바라보는 시점. */
export function CabinScene({
  state,
  onSelectFloor,
  onPressOpenDoor,
  onPressCloseDoor,
}: CabinSceneProps) {
  const canSelectFloor = state.phase === "boardingDoorsOpen";
  const canPressOpen = state.phase === "doorsClosing";
  const canPressClose =
    (state.phase === "boardingDoorsOpen" || state.phase === "closeCountdown") &&
    state.destinationFloor !== null;

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-6">
      <p className="text-sm text-muted-foreground">엘리베이터 안</p>

      <DoorPanel open={isDoorsOpen(state.phase)} className="max-w-xs" />

      <FloorIndicator floor={state.carFloor} direction={state.travelDirection} />

      <div className="grid grid-cols-5 gap-2" role="group" aria-label="층 버튼">
        {FLOOR_NUMBERS.map((floor) => (
          <Button
            key={floor}
            type="button"
            variant={state.destinationFloor === floor ? "default" : "outline"}
            disabled={!canSelectFloor || floor === state.carFloor}
            onClick={() => onSelectFloor(floor)}
            aria-pressed={state.destinationFloor === floor}
            className={cn(
              "h-11 w-11 font-mono text-base",
              state.destinationFloor === floor && "ring-2 ring-primary/50"
            )}
          >
            {floor}
          </Button>
        ))}
      </div>

      <div className="flex gap-3" role="group" aria-label="문 조작 버튼">
        <Button
          type="button"
          variant="secondary"
          disabled={!canPressOpen}
          onClick={onPressOpenDoor}
          className="h-12 w-28 gap-2"
        >
          <DoorOpen className="size-5" />
          열림
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={!canPressClose}
          onClick={onPressCloseDoor}
          className="h-12 w-28 gap-2"
        >
          <DoorClosed className="size-5" />
          닫힘
        </Button>
      </div>
    </div>
  );
}
