import { DoorClosed, DoorOpen } from "lucide-react";

import { ElevatorBay } from "./elevator-bay";
import { formatFloorLabel } from "./floor-format";
import { isDoorsOpen } from "./machine";
import { PanelButton } from "./panel-button";
import type { ElevatorTheme } from "./theme";
import type { CarState } from "./types";

interface CabinSceneProps {
  /** 지금 아이가 타고 있는 카. */
  car: CarState;
  /** 그 카의 배열 인덱스. A/B/C/D 레이블로 바꿔 "지금 이 카에 타고 있다"는 걸 보여준다. */
  carIndex: number;
  topFloor: number;
  bottomFloor: number;
  theme: ElevatorTheme;
  onSelectFloor: (floor: number) => void;
  onPressOpenDoor: () => void;
  onPressCloseDoor: () => void;
}

/** 로비와 같은 규칙(A, B, C, D)으로 카를 가리킨다. */
const CAR_LABELS = ["A", "B", "C", "D"];

/** 최상층부터 1층, 그다음 지하 1층부터 최하층까지 순서로 층 버튼 목록을 만든다(0층은 없다). */
function buildFloorNumbers(topFloor: number, bottomFloor: number): number[] {
  const floors: number[] = [];
  for (let floor = topFloor; floor >= 1; floor--) floors.push(floor);
  for (let floor = -1; floor >= -bottomFloor; floor--) floors.push(floor);
  return floors;
}

/** 엘리베이터 안에서 문을 바라보는 시점. */
export function CabinScene({
  car,
  carIndex,
  topFloor,
  bottomFloor,
  theme,
  onSelectFloor,
  onPressOpenDoor,
  onPressCloseDoor,
}: CabinSceneProps) {
  const canSelectFloor = car.phase === "boardingDoorsOpen" || car.phase === "closedWaitingForFloor";
  const canPressOpen = car.phase === "doorsClosing" || car.phase === "closedWaitingForFloor";
  const canPressClose = car.phase === "boardingDoorsOpen" || car.phase === "closeCountdown";
  const floorNumbers = buildFloorNumbers(topFloor, bottomFloor);
  const label = CAR_LABELS[carIndex] ?? String(carIndex + 1);

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-6">
      <ElevatorBay
        theme={theme}
        open={isDoorsOpen(car.phase)}
        scene="cabin"
        carFloor={car.carFloor}
        direction={car.travelDirection}
        label={label}
        className="max-w-xs"
      />

      <div className="grid w-full grid-cols-7 gap-1.5" role="group" aria-label="층 버튼">
        {floorNumbers.map((floor) => (
          <PanelButton
            key={floor}
            size="sm"
            theme={theme}
            active={car.destinationFloor === floor}
            disabled={!canSelectFloor || floor === car.carFloor}
            onClick={() => onSelectFloor(floor)}
            aria-pressed={car.destinationFloor === floor}
            aria-label={`${formatFloorLabel(floor)}층 버튼`}
          >
            {formatFloorLabel(floor)}
          </PanelButton>
        ))}
      </div>

      <div className="flex gap-6" role="group" aria-label="문 조작 버튼">
        <div className="flex flex-col items-center gap-1">
          <PanelButton theme={theme} disabled={!canPressOpen} onClick={onPressOpenDoor} aria-label="문 열림">
            <DoorOpen className="size-5" />
          </PanelButton>
          <span className="text-[11px] text-muted-foreground">열림</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <PanelButton theme={theme} disabled={!canPressClose} onClick={onPressCloseDoor} aria-label="문 닫힘">
            <DoorClosed className="size-5" />
          </PanelButton>
          <span className="text-[11px] text-muted-foreground">닫힘</span>
        </div>
      </div>
    </div>
  );
}
