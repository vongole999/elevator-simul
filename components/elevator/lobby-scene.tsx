import { ArrowDown, ArrowUp } from "lucide-react";

import { getCarLabel } from "./constants";
import { ElevatorBay } from "./elevator-bay";
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
}: LobbySceneProps) {
  const canCall = activeCarIndex === null;
  const canCallUp = standingFloor < topFloor;
  const canCallDown = standingFloor > -bottomFloor;

  return (
    <div className="flex w-full flex-col items-center gap-6">
      {/* 호출 버튼은 카마다가 아니라 이 층에 하나뿐이다 — 배차는 건물에
          요청하는 것이지 특정 카를 지목하는 게 아니다. 대수만큼의 문·
          표시기가 화면 가로 폭을 넉넉히 활용해 나란히 보인다. */}
      <div className="flex w-full flex-wrap justify-center gap-4" role="group" aria-label="엘리베이터">
        {cars.map((car, index) => (
          <CarDoor
            key={index}
            car={car}
            label={getCarLabel(index)}
            standingFloor={standingFloor}
            theme={theme}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3" role="group" aria-label="호출 버튼">
        {canCallUp && (
          <CallButton
            direction="up"
            active={callActive}
            disabled={!canCall}
            theme={theme}
            onPress={() => onCall("up")}
          />
        )}
        {canCallDown && (
          <CallButton
            direction="down"
            active={callActive}
            disabled={!canCall}
            theme={theme}
            onPress={() => onCall("down")}
          />
        )}
      </div>
    </div>
  );
}

interface CarDoorProps {
  car: CarState;
  label: string;
  standingFloor: number;
  theme: ElevatorTheme;
}

/**
 * 카 한 대의 문과 층 표시기 쌍.
 *
 * 이 카가 지금 아이가 서 있는 층(standingFloor)에 있지 않으면, 문이 열려
 * 있는 단계(예: 다른 층에서 자율 운행 승객을 태우는 pickupDoorsOpen)라도
 * 이 로비에서는 문을 닫힌 채로 보여준다. 로비에 실제로 없는 문이 열려
 * 보이면 안 되기 때문이다 — 표시기의 층 숫자만 바뀌는 것으로 그 카가 다른
 * 층에서 움직이고 있음을 알 수 있다.
 */
function CarDoor({ car, label, standingFloor, theme }: CarDoorProps) {
  const isAtThisFloor = car.carFloor === standingFloor;
  const open = isAtThisFloor && isDoorsOpen(car.phase);
  const riderVisible =
    isAtThisFloor && (car.phase === "pickupDoorsOpen" || car.phase === "alightingDoorsOpen");

  return (
    <div className="flex w-full max-w-xs flex-1 basis-40 flex-col items-center">
      <ElevatorBay
        theme={theme}
        open={open}
        scene="lobby"
        carFloor={car.carFloor}
        lobbyFloor={standingFloor}
        direction={car.travelDirection}
        label={label}
        riderVisible={riderVisible}
        className="w-full"
      />
    </div>
  );
}

interface CallButtonProps {
  direction: Direction;
  active: boolean;
  disabled: boolean;
  theme: ElevatorTheme;
  onPress: () => void;
}

function CallButton({ direction, active, disabled, theme, onPress }: CallButtonProps) {
  const Icon = direction === "up" ? ArrowUp : ArrowDown;
  const label = direction === "up" ? "위로 호출" : "아래로 호출";

  return (
    <div className="flex items-center gap-3">
      <PanelButton
        size="lg"
        active={active}
        disabled={disabled}
        theme={theme}
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
