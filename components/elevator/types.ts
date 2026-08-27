/** 엘리베이터가 움직이는 방향. */
export type Direction = "up" | "down";

/** 아이가 지금 보고 있는 화면 시점. */
export type ViewMode = "lobby" | "cabin";

/**
 * 카 한 대가 한 바퀴를 도는 유한 상태.
 *
 * idle → travelingToPickup → pickupDoorsOpen → boardingDoorsOpen
 *   → closeCountdown → doorsClosing → travelingToDestination
 *   → destinationDoorsOpen → alightingDoorsOpen → idle (반복)
 *
 * 카가 태우러 갈 층에 이미 있으면 travelingToPickup을 건너뛰고 곧바로
 * pickupDoorsOpen으로 들어간다. boardingDoorsOpen·closeCountdown 모두
 * 목적층 버튼 없이 시간이 지나거나 닫힘 버튼을 누르면 doorsClosing으로
 * 가는데, 목적층이 없으면 문만 닫히고 closedWaitingForFloor에서 목적층을
 * 기다린다.
 *
 * 아이가 타는 카든 자율 운행 카든 같은 단계를 돈다. 자율 운행 카는
 * 아이가 부르지 않아도 스스로 목적층을 정해(machine.ts의 dispatchCarToFloor·
 * AUTO_DEPART) 같은 흐름을 탄다.
 */
export type ElevatorPhase =
  | "idle"
  | "travelingToPickup"
  | "pickupDoorsOpen"
  | "boardingDoorsOpen"
  | "closeCountdown"
  | "doorsClosing"
  | "closedWaitingForFloor"
  | "travelingToDestination"
  | "destinationDoorsOpen"
  | "alightingDoorsOpen";

/** 카 한 대의 상태. */
export interface CarState {
  /** 이 카가 지금 있는 층. 이동 중에는 한 층씩 갱신된다. */
  carFloor: number;
  /** 이 카가 지금 진행 중인 단계. */
  phase: ElevatorPhase;
  /** 안쪽에서 누른(또는 자율 운행이 스스로 정한) 목적층. 점등 여부도 겸한다. */
  destinationFloor: number | null;
  /** 이동 중이거나 방금 이동을 마친 방향(안내 방송·표시기용). */
  travelDirection: Direction | null;
  /**
   * 재배차되어 문이 열려 있거나 닫히는 중이던 카가, 그 문 동작을 마친
   * 뒤 곧바로 태우러 갈 층(standingFloor)으로 출발해야 하는지.
   *
   * phase만으로는 "문이 닫히면 pickup 이동을 시작해야 하는지, 원래
   * destinationFloor로 이동해야 하는지"를 구분할 수 없어 이 필드로
   * 명시한다. DOORS_CLOSED에서 이 값을 보고 분기한 뒤 false로 되돌린다.
   */
  awaitingPickup: boolean;
}

export interface ElevatorState {
  /** 이 건물의 최상층(지상 층수). */
  topFloor: number;
  /** 이 건물의 지하 층수(0이면 지하 없음). 최하층은 -bottomFloor다. */
  bottomFloor: number;
  /** 바깥 시점일 때 보여줄, 아이가 서 있는 층. 0은 없다(1층 바로 아래는 -1). */
  standingFloor: number;
  /** 바깥/안쪽 중 지금 보여줄 화면. */
  view: ViewMode;
  /** 호출 버튼 점등 여부. */
  callActive: boolean;
  /**
   * 지금 아이의 호출에 응답해 태우러 오고 있거나, 아이가 타고 있는 카의
   * 배열 인덱스. 그 한 바퀴가 끝나 idle로 돌아가면 다시 null이 된다.
   * null인 카(이 인덱스가 아닌 모든 카)는 자율 운행 후보다.
   */
  activeCarIndex: number | null;
  /** 이 건물의 모든 카. */
  cars: CarState[];
}

export type ElevatorAction =
  | { type: "CALL"; direction: Direction }
  | { type: "SELECT_FLOOR"; floor: number }
  | { type: "PRESS_OPEN_DOOR" }
  | { type: "PRESS_CLOSE_DOOR" }
  | { type: "ADVANCE_CAR"; carIndex: number }
  | { type: "BOARDING_TIMEOUT"; carIndex: number }
  | { type: "AUTO_CLOSE_TIMEOUT"; carIndex: number }
  | { type: "DOORS_CLOSED"; carIndex: number }
  | { type: "ALIGHTED"; carIndex: number }
  | { type: "ALIGHTING_DOORS_TIMEOUT"; carIndex: number }
  /** idle한 카가 스스로 목적층을 정해 자율 운행 한 바퀴를 시작한다. */
  | { type: "AUTO_DEPART"; carIndex: number; destinationFloor: number };
