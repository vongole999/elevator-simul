import { ArrowDown, ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { BOTTOM_FLOOR, TOP_FLOOR } from "./constants";
import { DoorPanel } from "./door-panel";
import { FloorIndicator } from "./floor-indicator";
import { isDoorsOpen } from "./machine";
import type { Direction, ElevatorState } from "./types";

interface LobbySceneProps {
  state: ElevatorState;
  onCall: (direction: Direction) => void;
}

/** 아이가 서 있는 층의 로비에서 엘리베이터 문을 바라보는 시점. */
export function LobbyScene({ state, onCall }: LobbySceneProps) {
  const canCall = state.phase === "idle";
  const canCallUp = state.standingFloor < TOP_FLOOR;
  const canCallDown = state.standingFloor > BOTTOM_FLOOR;

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-6">
      <p className="text-sm text-muted-foreground">{state.standingFloor}층 로비</p>

      <DoorPanel open={isDoorsOpen(state.phase)} className="max-w-xs" />

      <FloorIndicator floor={state.carFloor} direction={state.travelDirection} />

      <div className="flex flex-col gap-2" role="group" aria-label="호출 버튼">
        {canCallUp && (
          <CallButton
            direction="up"
            active={state.callActive}
            disabled={!canCall}
            onPress={() => onCall("up")}
          />
        )}
        {canCallDown && (
          <CallButton
            direction="down"
            active={state.callActive}
            disabled={!canCall}
            onPress={() => onCall("down")}
          />
        )}
      </div>
    </div>
  );
}

interface CallButtonProps {
  direction: Direction;
  active: boolean;
  disabled: boolean;
  onPress: () => void;
}

function CallButton({ direction, active, disabled, onPress }: CallButtonProps) {
  const Icon = direction === "up" ? ArrowUp : ArrowDown;
  const label = direction === "up" ? "위로 호출" : "아래로 호출";

  return (
    <Button
      type="button"
      size="lg"
      variant={active ? "default" : "outline"}
      disabled={disabled}
      onClick={onPress}
      aria-pressed={active}
      className={cn("h-14 w-40 gap-2 text-base", active && "ring-2 ring-primary/50")}
    >
      <Icon className="size-5" />
      {label}
    </Button>
  );
}
