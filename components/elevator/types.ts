/** 엘리베이터가 움직이는 방향. */
export type Direction = "up" | "down";

/** 아이가 지금 보고 있는 화면 시점. */
export type ViewMode = "lobby" | "cabin";

/**
 * 한 바퀴를 이루는 유한 상태.
 *
 * idle → travelingToPickup → pickupDoorsOpen → boardingDoorsOpen
 *   → closeCountdown → doorsClosing → travelingToDestination
 *   → destinationDoorsOpen → idle (반복)
 *
 * 카가 호출한 층에 이미 있으면 travelingToPickup을 건너뛰고 곧바로
 * pickupDoorsOpen으로 들어간다.
 */
export type ElevatorPhase =
  | "idle"
  | "travelingToPickup"
  | "pickupDoorsOpen"
  | "boardingDoorsOpen"
  | "closeCountdown"
  | "doorsClosing"
  | "travelingToDestination"
  | "destinationDoorsOpen";

export interface ElevatorState {
  /** 바깥 시점일 때 보여줄, 아이가 서 있는 층. */
  standingFloor: number;
  /** 카가 지금 있는 층. 이동 중에는 한 층씩 갱신된다. */
  carFloor: number;
  /** 지금 진행 중인 단계. */
  phase: ElevatorPhase;
  /** 바깥/안쪽 중 지금 보여줄 화면. */
  view: ViewMode;
  /** 호출 버튼 점등 여부. */
  callActive: boolean;
  /** 안쪽에서 누른 목적층. 점등 여부도 겸한다. */
  destinationFloor: number | null;
  /** 이동 중이거나 방금 이동을 마친 방향(안내 방송·표시기용). */
  travelDirection: Direction | null;
}

export type ElevatorAction =
  | { type: "CALL"; direction: Direction }
  | { type: "SELECT_FLOOR"; floor: number }
  | { type: "PRESS_OPEN_DOOR" }
  | { type: "PRESS_CLOSE_DOOR" }
  | { type: "ADVANCE_CAR" }
  | { type: "BOARDING_TIMEOUT" }
  | { type: "AUTO_CLOSE_TIMEOUT" }
  | { type: "DOORS_CLOSED" }
  | { type: "ALIGHTING_TIMEOUT" };
