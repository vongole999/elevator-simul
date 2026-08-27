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

/** 로비와 같은 규칙(A, B, C, D, E, F)으로 카를 가리킨다. */
const CAR_LABELS = ["A", "B", "C", "D", "E", "F"];

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
    <div className="flex w-full flex-col items-center gap-4">
      {/* 문은 세로로 긴 모양을 유지하고, 층 버튼은 그 옆 가로 공간을 넉넉히
          쓰게 나란히 배치한다. 층수 최댓값이 커서 버튼이 최대 220개까지
          늘어날 수 있으므로, 버튼 영역만 정해진 높이 안에서 스크롤하게
          하고 문·표시기·문 조작 버튼은 항상 화면에 고정해 보이게 한다. */}
      <div className="flex w-full flex-col items-center gap-4 md:flex-row md:items-start md:justify-center">
        <ElevatorBay
          theme={theme}
          open={isDoorsOpen(car.phase)}
          scene="cabin"
          carFloor={car.carFloor}
          direction={car.travelDirection}
          label={label}
          className="w-full max-w-[200px] shrink-0"
        />

        {/* 열 개수를 브레이크포인트로 못박지 않고 auto-fill로 컨테이너
            폭에 맞춰 계산한다 — 버튼(size-9=2.25rem)이 고정폭이라
            grid-cols-N처럼 열 개수를 고정하면 좁은 화면에서 버튼이 셀보다
            커져 가로로 넘칠 수 있기 때문이다. 트랙 폭을 버튼 폭과 똑같이
            고정해 두면(min=max) 화면이 넓어질수록 열 개수만 늘어나고
            버튼 크기는 항상 일정하게 유지된다. */}
        <div
          className="grid w-full max-h-[32vh] justify-center gap-1.5 overflow-x-hidden overflow-y-auto p-1 md:max-h-[280px] md:flex-1 md:justify-start [grid-template-columns:repeat(auto-fill,minmax(2.25rem,2.25rem))]"
          role="group"
          aria-label="층 버튼"
        >
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
