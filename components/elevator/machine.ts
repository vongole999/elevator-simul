import { START_FLOOR } from "./constants";
import type { CarState, ElevatorAction, ElevatorPhase, ElevatorState } from "./types";

/** topFloor·bottomFloor짜리 건물에 carCount대가 있는 처음 상태를 만든다. 모든 카가 항상 지상 1층에서 시작한다. */
export function createInitialElevatorState(
  topFloor: number,
  bottomFloor: number,
  carCount: number
): ElevatorState {
  return {
    topFloor,
    bottomFloor,
    standingFloor: START_FLOOR,
    view: "lobby",
    callActive: false,
    activeCarIndex: null,
    cars: Array.from({ length: carCount }, (): CarState => ({
      carFloor: START_FLOOR,
      phase: "idle",
      destinationFloor: null,
      travelDirection: null,
      awaitingPickup: false,
    })),
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

/** cars 배열에서 index번째 카만 updater로 갱신한 새 배열을 만든다. */
function replaceCarAt(
  cars: CarState[],
  index: number,
  updater: (car: CarState) => CarState
): CarState[] {
  return cars.map((car, i) => (i === index ? updater(car) : car));
}

/**
 * floor로 배차할 카를 고른다. idle한 카 중 층 거리가 가장 가까운 카를
 * 우선하고, idle한 카가 하나도 없으면(모두 자율 운행 중이면) 전체 카 중
 * 층 거리가 가장 가까운 카를 고른다. 거리가 같으면 번호가 빠른(인덱스가
 * 작은) 카가 응답한다.
 */
function pickDispatchCarIndex(cars: CarState[], floor: number): number {
  const allIndices = cars.map((_, i) => i);
  const idleIndices = allIndices.filter((i) => cars[i].phase === "idle");
  const candidates = idleIndices.length > 0 ? idleIndices : allIndices;

  return candidates.reduce((closest, i) =>
    Math.abs(cars[i].carFloor - floor) < Math.abs(cars[closest].carFloor - floor) ? i : closest
  );
}

/**
 * 카 한 대를 floor로 보낸다. CALL로 새로 배차될 때와, idle한 카가 없어
 * 자율 운행 중이던 카가 즉시 멈춰 응답할 때(재배차) 모두 이 함수를 쓴다.
 *
 * 카가 지금 뭘 하고 있든, 그 흐름에서 가장 자연스러운 다음 지점부터
 * floor를 향하게 만든다:
 * - idle이면 그 자리에서(이미 floor에 있으면 곧장 문을 열고, 아니면
 *   이동을 시작한다).
 * - 층 사이를 이동 중이면 다음 층 도착까지는 마저 가고 그 다음 target을
 *   floor로 바꾼다(층 사이에서 순간적으로 방향이 바뀌면 부자연스럽다).
 * - 아직 사람이 타지 않았거나 막 타려는 참(pickupDoorsOpen·
 *   boardingDoorsOpen·closeCountdown)이거나 문이 닫히는 중(doorsClosing)
 *   이면, 그 문 동작은 그대로 이어가되(시각적으로 끊기지 않는다) 문이
 *   닫히면 pickup 이동을 시작하도록 awaitingPickup을 세워 둔다.
 * - 자율 승객이 막 내리는 중(destinationDoorsOpen·alightingDoorsOpen)이면
 *   그 승객은 이미 내린 것으로 보고 곧장 새 손님을 태우는 상황으로
 *   재진입한다.
 */
/**
 * 카가 이동을 시작해야 할 때(idle에서 새로 출발하거나, 문이 닫힌 채
 * 곧바로 움직여야 할 때) 공통으로 쓰는 전이. 카가 이미 floor에 있으면
 * 이동할 필요 없이 곧장 문을 열고, 아니면 travelingToPickup으로 보낸다.
 *
 * 이미 그 층에 있는데도 travelDirection을 계산해 travelingToPickup으로
 * 보내면 directionTo가 null을 반환하고, ADVANCE_CAR가 이를 "내려가는
 * 중"으로 오판해 불필요하게 한 층 내려갔다 올라오는 문제가 생긴다.
 */
function startTravelToFloor(car: CarState, floor: number): CarState {
  if (car.carFloor === floor) {
    return { ...car, phase: "pickupDoorsOpen", destinationFloor: null, travelDirection: null };
  }
  return {
    ...car,
    phase: "travelingToPickup",
    destinationFloor: null,
    travelDirection: directionTo(car.carFloor, floor),
  };
}

function dispatchCarToFloor(car: CarState, floor: number): CarState {
  if (car.phase === "idle") {
    return startTravelToFloor(car, floor);
  }

  if (isCarTraveling(car.phase)) {
    return startTravelToFloor(car, floor);
  }

  if (
    car.phase === "pickupDoorsOpen" ||
    car.phase === "boardingDoorsOpen" ||
    car.phase === "closeCountdown" ||
    car.phase === "doorsClosing"
  ) {
    return { ...car, destinationFloor: null, awaitingPickup: true };
  }

  if (car.phase === "destinationDoorsOpen" || car.phase === "alightingDoorsOpen") {
    return { ...car, phase: "pickupDoorsOpen", destinationFloor: null, travelDirection: null };
  }

  // closedWaitingForFloor: 문이 이미 닫혀 있으니 곧바로 움직인다.
  return startTravelToFloor(car, floor);
}

export function elevatorReducer(
  state: ElevatorState,
  action: ElevatorAction
): ElevatorState {
  switch (action.type) {
    case "CALL": {
      // 이미 응답 중이거나 태우고 이동 중인 카가 있으면 새 호출은 받지 않는다.
      if (state.activeCarIndex !== null) return state;

      const carIndex = pickDispatchCarIndex(state.cars, state.standingFloor);
      const dispatchedCar = dispatchCarToFloor(state.cars[carIndex], state.standingFloor);

      return {
        ...state,
        // 배차된 카가 이미 그 층(standingFloor)에 있어 곧바로 문을 열면,
        // 실제로 "기다리는 동안 켜져 있는 불"이 없으므로 켜지 않는다. 재배차로
        // 다른 층에서 문이 열린 채 pickup 상황이 된 카는 아직 도착한 게
        // 아니므로 계속 켜 둔다.
        callActive: !(
          dispatchedCar.phase === "pickupDoorsOpen" && dispatchedCar.carFloor === state.standingFloor
        ),
        activeCarIndex: carIndex,
        cars: replaceCarAt(state.cars, carIndex, () => dispatchedCar),
      };
    }

    case "ADVANCE_CAR": {
      const car = state.cars[action.carIndex];
      if (!car || !isCarTraveling(car.phase)) return state;

      // travelingToPickup의 목적지는 항상 아이가 서 있는 층이다(재배차로
      // pickup 상황이 된 자율 운행 카도 마찬가지). travelingToDestination은
      // 그 카 자신의 destinationFloor를 향한다.
      const target = car.phase === "travelingToPickup" ? state.standingFloor : car.destinationFloor;
      if (target === null) return state;

      const step = target > car.carFloor ? 1 : -1;
      const nextCarFloor = stepFloor(car.carFloor, step);

      if (nextCarFloor !== target) {
        return {
          ...state,
          cars: replaceCarAt(state.cars, action.carIndex, (c) => ({ ...c, carFloor: nextCarFloor })),
        };
      }

      // 목표 층 도착.
      if (car.phase === "travelingToPickup") {
        return {
          ...state,
          callActive: action.carIndex === state.activeCarIndex ? false : state.callActive,
          cars: replaceCarAt(state.cars, action.carIndex, (c) => ({
            ...c,
            carFloor: nextCarFloor,
            phase: "pickupDoorsOpen",
            travelDirection: null,
          })),
        };
      }

      const isActiveCar = action.carIndex === state.activeCarIndex;
      return {
        ...state,
        // 자율 운행 카가 자기 목적지에 도착한 것은 아이의 위치와 무관하다.
        standingFloor: isActiveCar ? nextCarFloor : state.standingFloor,
        cars: replaceCarAt(state.cars, action.carIndex, (c) => ({
          ...c,
          carFloor: nextCarFloor,
          phase: "destinationDoorsOpen",
          destinationFloor: null,
          travelDirection: null,
        })),
      };
    }

    case "BOARDING_TIMEOUT": {
      const car = state.cars[action.carIndex];
      if (!car || car.phase !== "pickupDoorsOpen") return state;
      return {
        ...state,
        view: action.carIndex === state.activeCarIndex ? "cabin" : state.view,
        cars: replaceCarAt(state.cars, action.carIndex, (c) => ({ ...c, phase: "boardingDoorsOpen" })),
      };
    }

    case "SELECT_FLOOR": {
      if (state.activeCarIndex === null) return state;
      const car = state.cars[state.activeCarIndex];
      if (car.phase !== "boardingDoorsOpen" && car.phase !== "closedWaitingForFloor") {
        return state;
      }
      if (action.floor === 0) return state;
      if (action.floor < -state.bottomFloor || action.floor > state.topFloor) return state;
      // 지금 있는 층을 다시 누르는 조작은 두지 않는다(이동할 곳이 없다).
      if (action.floor === car.carFloor) return state;

      if (car.phase === "closedWaitingForFloor") {
        // 문이 이미 닫혀 있으니 다시 여닫을 필요 없이 곧바로 움직인다.
        return {
          ...state,
          cars: replaceCarAt(state.cars, state.activeCarIndex, (c) => ({
            ...c,
            phase: "travelingToDestination",
            destinationFloor: action.floor,
            travelDirection: directionTo(c.carFloor, action.floor),
          })),
        };
      }
      return {
        ...state,
        cars: replaceCarAt(state.cars, state.activeCarIndex, (c) => ({
          ...c,
          phase: "closeCountdown",
          destinationFloor: action.floor,
        })),
      };
    }

    case "PRESS_CLOSE_DOOR": {
      if (state.activeCarIndex === null) return state;
      const car = state.cars[state.activeCarIndex];
      // 목적층을 고르기 전이라도 닫을 수 있다 — 실제 엘리베이터도 그렇다.
      if (car.phase !== "boardingDoorsOpen" && car.phase !== "closeCountdown") {
        return state;
      }
      return {
        ...state,
        cars: replaceCarAt(state.cars, state.activeCarIndex, (c) => ({ ...c, phase: "doorsClosing" })),
      };
    }

    case "PRESS_OPEN_DOOR": {
      if (state.activeCarIndex === null) return state;
      const car = state.cars[state.activeCarIndex];
      // 열림 버튼은 doorsClosing·closedWaitingForFloor에서만 눌린다(문이
      // 이미 열려 있으면 버튼 자체가 disabled). 두 상태 모두 아직 목적층을
      // 향해 실제로 출발하지 않았으므로, 열림 버튼을 누르면 그 이동을
      // 포기하고 지금 이 층(탑승한 층)에서 곧장 내리는 것으로 본다.
      // destinationDoorsOpen으로 보내 목적층에 도착했을 때와 같은 흐름
      // (도착 안내 → 잠시 뒤 alightingDoorsOpen → idle)을 그대로 탄다.
      if (car.phase === "doorsClosing" || car.phase === "closedWaitingForFloor") {
        return {
          ...state,
          cars: replaceCarAt(state.cars, state.activeCarIndex, (c) => ({
            ...c,
            phase: "destinationDoorsOpen",
            destinationFloor: null,
            travelDirection: null,
          })),
        };
      }
      return state;
    }

    case "AUTO_CLOSE_TIMEOUT": {
      // 목적층을 고르지 않고 방치해도(boardingDoorsOpen), 골라서 기다리는 중이어도
      // (closeCountdown) 시간이 지나면 저절로 닫히기 시작한다. 아이가 타는 카든
      // 자율 운행 카든 같다.
      const car = state.cars[action.carIndex];
      if (!car || (car.phase !== "boardingDoorsOpen" && car.phase !== "closeCountdown")) {
        return state;
      }
      return {
        ...state,
        cars: replaceCarAt(state.cars, action.carIndex, (c) => ({ ...c, phase: "doorsClosing" })),
      };
    }

    case "DOORS_CLOSED": {
      const car = state.cars[action.carIndex];
      if (!car || car.phase !== "doorsClosing") return state;

      // 재배차되어 문을 마저 닫은 카는, 목적층 유무와 무관하게 곧바로
      // 아이가 서 있는 층으로 출발한다.
      if (car.awaitingPickup) {
        return {
          ...state,
          cars: replaceCarAt(state.cars, action.carIndex, (c) => ({
            ...c,
            phase: "travelingToPickup",
            awaitingPickup: false,
            travelDirection: directionTo(c.carFloor, state.standingFloor),
          })),
        };
      }
      // 목적층 없이 닫혔으면 그 자리에 선 채 목적층을 기다린다.
      if (car.destinationFloor === null) {
        return {
          ...state,
          cars: replaceCarAt(state.cars, action.carIndex, (c) => ({ ...c, phase: "closedWaitingForFloor" })),
        };
      }
      return {
        ...state,
        cars: replaceCarAt(state.cars, action.carIndex, (c) => ({
          ...c,
          phase: "travelingToDestination",
          travelDirection: directionTo(c.carFloor, c.destinationFloor as number),
        })),
      };
    }

    case "ALIGHTED": {
      // 목적층 문이 열린 채 잠시 지나면 화면은 로비로 바뀌지만, 문은 아직 열려 있다.
      const car = state.cars[action.carIndex];
      if (!car || car.phase !== "destinationDoorsOpen") return state;
      return {
        ...state,
        view: action.carIndex === state.activeCarIndex ? "lobby" : state.view,
        cars: replaceCarAt(state.cars, action.carIndex, (c) => ({ ...c, phase: "alightingDoorsOpen" })),
      };
    }

    case "ALIGHTING_DOORS_TIMEOUT": {
      const car = state.cars[action.carIndex];
      if (!car || car.phase !== "alightingDoorsOpen") return state;
      const wasActiveCar = action.carIndex === state.activeCarIndex;
      return {
        ...state,
        // 아이의 한 바퀴가 끝났으니 이 카를 다시 자율 운행 후보로 풀어준다.
        activeCarIndex: wasActiveCar ? null : state.activeCarIndex,
        callActive: wasActiveCar ? false : state.callActive,
        cars: replaceCarAt(state.cars, action.carIndex, (c) => ({ ...c, phase: "idle" })),
      };
    }

    case "AUTO_DEPART": {
      const car = state.cars[action.carIndex];
      if (!car || car.phase !== "idle") return state;
      if (action.carIndex === state.activeCarIndex) return state;
      if (action.destinationFloor === car.carFloor) return state;

      // 자율 운행 카는 이미 그 층에 있으니 이동 없이 곧장 문을 연다. 목적층은
      // 미리 정해 두고, 이후 BOARDING_TIMEOUT·AUTO_CLOSE_TIMEOUT·DOORS_CLOSED가
      // 아이가 타는 카와 똑같은 흐름으로 그 목적층까지 데려간다.
      return {
        ...state,
        cars: replaceCarAt(state.cars, action.carIndex, (c) => ({
          ...c,
          phase: "pickupDoorsOpen",
          destinationFloor: action.destinationFloor,
        })),
      };
    }

    default:
      return state;
  }
}
