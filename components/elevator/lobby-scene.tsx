import { ArrowDown, ArrowUp, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";

import { DoorPanel } from "./door-panel";
import { FloorIndicator } from "./floor-indicator";
import { formatFloorLabel } from "./floor-format";
import { isDoorsOpen } from "./machine";
import { PanelButton } from "./panel-button";
import type { ElevatorTheme } from "./theme";
import type { Direction, ElevatorState } from "./types";

interface LobbySceneProps {
  state: ElevatorState;
  theme: ElevatorTheme;
  onCall: (direction: Direction) => void;
  onOpenSettings: () => void;
}

/** 아이가 서 있는 층의 로비에서 엘리베이터 문을 바라보는 시점. */
export function LobbyScene({ state, theme, onCall, onOpenSettings }: LobbySceneProps) {
  const canCall = state.phase === "idle";
  const canCallUp = state.standingFloor < state.topFloor;
  const canCallDown = state.standingFloor > -state.bottomFloor;
  const standingLabel = formatFloorLabel(state.standingFloor);
  const standingWord = state.standingFloor > 0 ? `${standingLabel}층` : standingLabel;

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-6">
      <div className="flex w-full items-center justify-between">
        <span className="text-sm text-muted-foreground">{standingWord} 로비</span>
        {canCall && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onOpenSettings}
            aria-label="건물 설정으로 돌아가기"
          >
            <Settings className="size-4" />
          </Button>
        )}
      </div>

      <DoorPanel open={isDoorsOpen(state.phase)} theme={theme} scene="lobby" className="max-w-xs" />

      <FloorIndicator floor={state.carFloor} direction={state.travelDirection} theme={theme} />

      <div className="flex flex-col gap-3" role="group" aria-label="호출 버튼">
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
    <div className="flex items-center gap-3">
      <PanelButton
        size="lg"
        active={active}
        disabled={disabled}
        onClick={onPress}
        aria-pressed={active}
        aria-label={label}
      >
        <Icon className="size-6" />
      </PanelButton>
      <span className="text-sm font-medium text-muted-foreground">
        {direction === "up" ? "올라가는 방향" : "내려가는 방향"}
      </span>
    </div>
  );
}
