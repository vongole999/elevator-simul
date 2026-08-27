import { ArrowDown, ArrowUp, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";

import { DoorPanel } from "./door-panel";
import { FloorIndicator } from "./floor-indicator";
import { formatFloorLabel } from "./floor-format";
import { isDoorsOpen } from "./machine";
import { PanelButton } from "./panel-button";
import type { ElevatorTheme } from "./theme";
import type { CarState, Direction } from "./types";

interface LobbySceneProps {
  /** 이 건물의 모든 카. 대수만큼 문·표시기가 나란히 보인다. */
  cars: CarState[];
  standingFloor: number;
  topFloor: number;
  bottomFloor: number;
  /** 지금 아이의 호출에 응답 중이거나 아이를 태우고 있는 카. 없으면 새 호출을 받을 수 있다. */
  activeCarIndex: number | null;
  callActive: boolean;
  theme: ElevatorTheme;
  onCall: (direction: Direction) => void;
  onOpenSettings: () => void;
}

/** 아이가 서 있는 층의 로비에서 엘리베이터 문(들)을 바라보는 시점. */
export function LobbyScene({
  cars,
  standingFloor,
  topFloor,
  bottomFloor,
  activeCarIndex,
  callActive,
  theme,
  onCall,
  onOpenSettings,
}: LobbySceneProps) {
  const canCall = activeCarIndex === null;
  const canCallUp = standingFloor < topFloor;
  const canCallDown = standingFloor > -bottomFloor;
  const standingLabel = formatFloorLabel(standingFloor);
  const standingWord = standingFloor > 0 ? `${standingLabel}층` : standingLabel;

  return (
    <div className="flex w-full flex-col items-center gap-6">
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

      {/* 호출 버튼은 카마다가 아니라 이 층에 하나뿐이다 — 배차는 건물에
          요청하는 것이지 특정 카를 지목하는 게 아니다. 대수만큼의 문·
          표시기가 화면 가로 폭을 넉넉히 활용해 나란히 보인다. */}
      <div className="flex w-full flex-wrap justify-center gap-4" role="group" aria-label="엘리베이터">
        {cars.map((car, index) => (
          <CarDoor key={index} car={car} theme={theme} />
        ))}
      </div>

      <div className="flex flex-col gap-3" role="group" aria-label="호출 버튼">
        {canCallUp && (
          <CallButton
            direction="up"
            active={callActive}
            disabled={!canCall}
            onPress={() => onCall("up")}
          />
        )}
        {canCallDown && (
          <CallButton
            direction="down"
            active={callActive}
            disabled={!canCall}
            onPress={() => onCall("down")}
          />
        )}
      </div>
    </div>
  );
}

interface CarDoorProps {
  car: CarState;
  theme: ElevatorTheme;
}

/** 카 한 대의 문과 층 표시기 쌍. */
function CarDoor({ car, theme }: CarDoorProps) {
  return (
    <div className="flex w-full max-w-xs flex-1 basis-40 flex-col items-center gap-3">
      <DoorPanel open={isDoorsOpen(car.phase)} theme={theme} scene="lobby" className="w-full" />
      <FloorIndicator floor={car.carFloor} direction={car.travelDirection} theme={theme} />
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
