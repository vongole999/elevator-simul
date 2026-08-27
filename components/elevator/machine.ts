import { START_FLOOR } from "./constants";
import type { ElevatorAction, ElevatorPhase, ElevatorState } from "./types";

/** topFloor·bottomFloor짜리 건물의 처음 상태를 만든다. 항상 지상 1층에서 시작한다. */
export function createInitialElevatorState(
  topFloor: number,
  bottomFloor: number
): ElevatorState {
  return {
    topFloor,
    bottomFloor,
    standingFloor: START_FLOOR,
    carFloor: START_FLOOR,
    phase: "idle",
    view: "lobby",
    callActive: false,
    destinationFloor: null,
    travelDirection: null,
  };
}

/** 문이 열려 있어야 하는 단계인지. 문 애니메이션은 이 값 하나로만 구동한다. */
export function isDoorsOpen(phase: ElevatorPhase): boolean {
  return (
    phase === "pickupDoorsOpen" ||
    phase === "boardingDoorsOpen" ||
    phase === "closeCountdown" ||
    phase === "destinationDoorsOpen" ||
    phase === "alightingDoorsOpen"
  );
}

/** 카가 층 사이를 실제로 이동하고 있는 단계인지. */
export function isCarTraveling(phase: ElevatorPhase): boolean {
  return phase === "travelingToPickup" || phase === "travelingToDestination";
}

function directionTo(from: number, to: number): "up" | "down" | null {
  if (to === from) return null;
  return to > from ? "up" : "down";
}

/**
 * 층을 한 칸 옮긴다. 0층은 없으므로(1층 바로 아래는 -1) 0을 지나게 되면
 * 한 칸 더 옮겨 건너뛴다.
 */
function stepFloor(current: number, step: 1 | -1): number {
  const next = current + step;
  return next === 0 ? next + step : next;
}

export function elevatorReducer(
  state: ElevatorState,
  action: ElevatorAction
): ElevatorState {
  switch (action.type) {
    case "CALL": {
      if (state.phase !== "idle") return state;
      // 카가 이미 아이가 서 있는 층에 있으면 이동 없이 곧바로 도착 처리한다.
      if (state.carFloor === state.standingFloor) {
        return { ...state, phase: "pickupDoorsOpen", callActive: false };
      }
      return {
        ...state,
        phase: "travelingToPickup",
        callActive: true,
        travelDirection: directionTo(state.carFloor, state.standingFloor),
      };
    }

    case "ADVANCE_CAR": {
      if (!isCarTraveling(state.phase)) return state;
      const target =
        state.phase === "travelingToPickup"
          ? state.standingFloor
          : state.destinationFloor;
      if (target === null) return state;

      const step = target > state.carFloor ? 1 : -1;
      const nextCarFloor = stepFloor(state.carFloor, step);

      if (nextCarFloor !== target) {
        return { ...state, carFloor: nextCarFloor };
      }

      // 목표 층 도착.
      if (state.phase === "travelingToPickup") {
        return {
          ...state,
          carFloor: nextCarFloor,
          phase: "pickupDoorsOpen",
          callActive: false,
          travelDirection: null,
        };
      }
      return {
        ...state,
        carFloor: nextCarFloor,
        standingFloor: nextCarFloor,
        phase: "destinationDoorsOpen",
        destinationFloor: null,
        travelDirection: null,
      };
    }

    case "BOARDING_TIMEOUT": {
      if (state.phase !== "pickupDoorsOpen") return state;
      return { ...state, phase: "boardingDoorsOpen", view: "cabin" };
    }

    case "SELECT_FLOOR": {
      if (state.phase !== "boardingDoorsOpen" && state.phase !== "closedWaitingForFloor") {
        return state;
      }
      if (action.floor === 0) return state;
      if (action.floor < -state.bottomFloor || action.floor > state.topFloor) return state;
      // 지금 있는 층을 다시 누르는 조작은 두지 않는다(이동할 곳이 없다).
      if (action.floor === state.carFloor) return state;

      if (state.phase === "closedWaitingForFloor") {
        // 문이 이미 닫혀 있으니 다시 여닫을 필요 없이 곧바로 움직인다.
        return {
          ...state,
          phase: "travelingToDestination",
          destinationFloor: action.floor,
          travelDirection: directionTo(state.carFloor, action.floor),
        };
      }
      return { ...state, phase: "closeCountdown", destinationFloor: action.floor };
    }

    case "PRESS_CLOSE_DOOR": {
      // 목적층을 고르기 전이라도 닫을 수 있다 — 실제 엘리베이터도 그렇다.
      if (state.phase !== "boardingDoorsOpen" && state.phase !== "closeCountdown") {
        return state;
      }
      return { ...state, phase: "doorsClosing" };
    }

    case "PRESS_OPEN_DOOR": {
      // "닫히던 문이 다시 열리고 기다림이 처음부터 다시 시작된다" — doorsClosing일 때만 의미가 있다.
      if (state.phase === "doorsClosing") {
        return { ...state, phase: state.destinationFloor !== null ? "closeCountdown" : "boardingDoorsOpen" };
      }
      // 문이 닫힌 채 층 버튼을 기다리던 중에도 다시 열어줄 수 있다.
      if (state.phase === "closedWaitingForFloor") {
        return { ...state, phase: "boardingDoorsOpen" };
      }
      return state;
    }

    case "AUTO_CLOSE_TIMEOUT": {
      // 층 버튼을 고르지 않고 방치해도(boardingDoorsOpen), 골라서 기다리는 중이어도
      // (closeCountdown) 시간이 지나면 저절로 닫히기 시작한다.
      if (state.phase !== "boardingDoorsOpen" && state.phase !== "closeCountdown") {
        return state;
      }
      return { ...state, phase: "doorsClosing" };
    }

    case "DOORS_CLOSED": {
      if (state.phase !== "doorsClosing") return state;
      // 목적층 없이 닫혔으면 그 자리에 선 채 층 버튼을 기다린다.
      if (state.destinationFloor === null) {
        return { ...state, phase: "closedWaitingForFloor" };
      }
      return {
        ...state,
        phase: "travelingToDestination",
        travelDirection: directionTo(state.carFloor, state.destinationFloor),
      };
    }

    case "ALIGHTED": {
      // 목적층 문이 열린 채 잠시 지나면 화면은 로비로 바뀌지만, 문은 아직 열려 있다.
      if (state.phase !== "destinationDoorsOpen") return state;
      return { ...state, phase: "alightingDoorsOpen", view: "lobby" };
    }

    case "ALIGHTING_DOORS_TIMEOUT": {
      if (state.phase !== "alightingDoorsOpen") return state;
      return { ...state, phase: "idle" };
    }

    default:
      return state;
  }
}
