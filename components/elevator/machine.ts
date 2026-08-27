import { BOTTOM_FLOOR, START_FLOOR, TOP_FLOOR } from "./constants";
import type { ElevatorAction, ElevatorPhase, ElevatorState } from "./types";

export const initialElevatorState: ElevatorState = {
  standingFloor: START_FLOOR,
  carFloor: START_FLOOR,
  phase: "idle",
  view: "lobby",
  callActive: false,
  destinationFloor: null,
  travelDirection: null,
};

/** 문이 열려 있어야 하는 단계인지. 문 애니메이션은 이 값 하나로만 구동한다. */
export function isDoorsOpen(phase: ElevatorPhase): boolean {
  return (
    phase === "pickupDoorsOpen" ||
    phase === "boardingDoorsOpen" ||
    phase === "closeCountdown" ||
    phase === "destinationDoorsOpen"
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
      const nextCarFloor = state.carFloor + step;

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
      if (state.phase !== "boardingDoorsOpen") return state;
      if (action.floor < BOTTOM_FLOOR || action.floor > TOP_FLOOR) return state;
      // 지금 있는 층을 다시 누르는 조작은 두지 않는다(이동할 곳이 없다).
      if (action.floor === state.carFloor) return state;
      return { ...state, phase: "closeCountdown", destinationFloor: action.floor };
    }

    case "PRESS_CLOSE_DOOR": {
      if (state.phase !== "boardingDoorsOpen" && state.phase !== "closeCountdown") {
        return state;
      }
      // 목적층을 고르기 전에는 닫아도 갈 곳이 없으므로 누르지 못하게 막는다.
      if (state.destinationFloor === null) return state;
      return { ...state, phase: "doorsClosing" };
    }

    case "PRESS_OPEN_DOOR": {
      // "닫히던 문이 다시 열리고 기다림이 처음부터 다시 시작된다" — doorsClosing일 때만 의미가 있다.
      if (state.phase !== "doorsClosing") return state;
      return { ...state, phase: "closeCountdown" };
    }

    case "AUTO_CLOSE_TIMEOUT": {
      if (state.phase !== "closeCountdown") return state;
      return { ...state, phase: "doorsClosing" };
    }

    case "DOORS_CLOSED": {
      if (state.phase !== "doorsClosing") return state;
      if (state.destinationFloor === null) return state;
      return {
        ...state,
        phase: "travelingToDestination",
        travelDirection: directionTo(state.carFloor, state.destinationFloor),
      };
    }

    case "ALIGHTING_TIMEOUT": {
      if (state.phase !== "destinationDoorsOpen") return state;
      return { ...state, phase: "idle", view: "lobby" };
    }

    default:
      return state;
  }
}
