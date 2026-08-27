import { describe, expect, it } from "vitest";

import { createInitialElevatorState, elevatorReducer, isDoorsOpen } from "./machine";
import type { CarState, ElevatorState } from "./types";

function run(state: ElevatorState, ...actions: Parameters<typeof elevatorReducer>[1][]) {
  return actions.reduce(elevatorReducer, state);
}

/** 지상 10층·지하 없는 건물의 처음 상태. carCount 기본값은 1대다. */
function baseState(carCount = 1): ElevatorState {
  return createInitialElevatorState(10, 0, carCount);
}

/** index번째 카의 필드 일부를 덮어쓴 새 상태를 만든다. */
function withCar(state: ElevatorState, index: number, patch: Partial<CarState>): ElevatorState {
  return {
    ...state,
    cars: state.cars.map((car, i) => (i === index ? { ...car, ...patch } : car)),
  };
}

describe("elevatorReducer — 카 한 대짜리 건물의 한 바퀴", () => {
  it("카가 이미 아이가 서 있는 층에 있으면 호출 즉시 문이 열리는 단계로 간다", () => {
    const next = elevatorReducer(baseState(), { type: "CALL", direction: "up" });

    expect(next.cars[0].phase).toBe("pickupDoorsOpen");
    expect(next.callActive).toBe(false);
    expect(next.activeCarIndex).toBe(0);
  });

  it("카가 다른 층에 있으면 호출 시 이동을 시작하고 호출 버튼이 켜진다", () => {
    const state = withCar({ ...baseState(), standingFloor: 1 }, 0, { carFloor: 5 });
    const next = elevatorReducer(state, { type: "CALL", direction: "down" });

    expect(next.cars[0].phase).toBe("travelingToPickup");
    expect(next.callActive).toBe(true);
    expect(next.cars[0].travelDirection).toBe("down");
    expect(next.activeCarIndex).toBe(0);
  });

  it("이동 중에는 한 층씩 전진하고, 지나는 층마다 carFloor가 바뀐다", () => {
    const state = withCar(
      { ...baseState(), standingFloor: 3, activeCarIndex: 0 },
      0,
      { carFloor: 1, phase: "travelingToPickup" }
    );

    const afterOne = elevatorReducer(state, { type: "ADVANCE_CAR", carIndex: 0 });
    expect(afterOne.cars[0].carFloor).toBe(2);
    expect(afterOne.cars[0].phase).toBe("travelingToPickup");

    const afterTwo = elevatorReducer(afterOne, { type: "ADVANCE_CAR", carIndex: 0 });
    expect(afterTwo.cars[0].carFloor).toBe(3);
    expect(afterTwo.cars[0].phase).toBe("pickupDoorsOpen");
    expect(afterTwo.callActive).toBe(false);
  });

  it("승차 대기가 끝나면 안쪽 시점으로 바뀐다", () => {
    const state = withCar({ ...baseState(), activeCarIndex: 0 }, 0, { phase: "pickupDoorsOpen" });
    const next = elevatorReducer(state, { type: "BOARDING_TIMEOUT", carIndex: 0 });

    expect(next.view).toBe("cabin");
    expect(next.cars[0].phase).toBe("boardingDoorsOpen");
  });

  it("지금 있는 층 버튼은 눌러도 무시한다", () => {
    const state = withCar(
      { ...baseState(), activeCarIndex: 0 },
      0,
      { phase: "boardingDoorsOpen", carFloor: 4 }
    );
    const next = elevatorReducer(state, { type: "SELECT_FLOOR", floor: 4 });

    expect(next).toBe(state);
  });

  it("건물 범위 밖 층 버튼은 무시한다", () => {
    const state = withCar({ ...baseState(), activeCarIndex: 0 }, 0, { phase: "boardingDoorsOpen" });

    expect(elevatorReducer(state, { type: "SELECT_FLOOR", floor: 11 })).toBe(state);
    expect(elevatorReducer(state, { type: "SELECT_FLOOR", floor: 0 })).toBe(state);
  });

  it("층 버튼을 누르면 그 버튼이 켜지고 자동 닫힘 대기로 들어간다", () => {
    const state = withCar(
      { ...baseState(), activeCarIndex: 0 },
      0,
      { phase: "boardingDoorsOpen", carFloor: 1 }
    );
    const next = elevatorReducer(state, { type: "SELECT_FLOOR", floor: 7 });

    expect(next.cars[0].phase).toBe("closeCountdown");
    expect(next.cars[0].destinationFloor).toBe(7);
  });

  it("층 버튼을 고르지 않고 방치해도 시간이 지나면 저절로 닫히기 시작한다", () => {
    const state = withCar({ ...baseState(), activeCarIndex: 0 }, 0, { phase: "boardingDoorsOpen" });
    const next = elevatorReducer(state, { type: "AUTO_CLOSE_TIMEOUT", carIndex: 0 });

    expect(next.cars[0].phase).toBe("doorsClosing");
    expect(next.cars[0].destinationFloor).toBeNull();
  });

  it("목적층을 고르기 전에도 닫힘 버튼을 누르면 바로 닫히기 시작한다", () => {
    const state = withCar(
      { ...baseState(), activeCarIndex: 0 },
      0,
      { phase: "boardingDoorsOpen", destinationFloor: null }
    );
    const next = elevatorReducer(state, { type: "PRESS_CLOSE_DOOR" });

    expect(next.cars[0].phase).toBe("doorsClosing");
  });

  it("닫힘 버튼을 누르면 기다림 없이 바로 닫히기 시작한다", () => {
    const state = withCar(
      { ...baseState(), activeCarIndex: 0 },
      0,
      { phase: "closeCountdown", destinationFloor: 7 }
    );
    const next = elevatorReducer(state, { type: "PRESS_CLOSE_DOOR" });

    expect(next.cars[0].phase).toBe("doorsClosing");
  });

  it("자동 닫힘 대기 시간이 지나면 저절로 닫히기 시작한다", () => {
    const state = withCar(
      { ...baseState(), activeCarIndex: 0 },
      0,
      { phase: "closeCountdown", destinationFloor: 7 }
    );
    const next = elevatorReducer(state, { type: "AUTO_CLOSE_TIMEOUT", carIndex: 0 });

    expect(next.cars[0].phase).toBe("doorsClosing");
  });

  it("닫히는 중 열림 버튼을 누르면 목적층 이동을 포기하고 지금 층에서 내린다", () => {
    const state = withCar(
      { ...baseState(), activeCarIndex: 0 },
      0,
      { phase: "doorsClosing", destinationFloor: 7 }
    );
    const next = elevatorReducer(state, { type: "PRESS_OPEN_DOOR" });

    expect(next.cars[0].phase).toBe("destinationDoorsOpen");
    expect(next.cars[0].destinationFloor).toBeNull();
    expect(isDoorsOpen(next.cars[0].phase)).toBe(true);
  });

  it("목적층 없이 닫히는 중 열림 버튼을 누르면 그냥 지금 층에서 내린다", () => {
    const state = withCar(
      { ...baseState(), activeCarIndex: 0 },
      0,
      { phase: "doorsClosing", destinationFloor: null }
    );
    const next = elevatorReducer(state, { type: "PRESS_OPEN_DOOR" });

    expect(next.cars[0].phase).toBe("destinationDoorsOpen");
  });

  it("문이 닫히면 목적층 방향으로 이동을 시작한다", () => {
    const state = withCar(
      { ...baseState(), activeCarIndex: 0 },
      0,
      { phase: "doorsClosing", carFloor: 3, destinationFloor: 1 }
    );
    const next = elevatorReducer(state, { type: "DOORS_CLOSED", carIndex: 0 });

    expect(next.cars[0].phase).toBe("travelingToDestination");
    expect(next.cars[0].travelDirection).toBe("down");
  });

  it("목적층 없이 문이 닫히면 그 자리에 선 채 층 버튼을 기다린다", () => {
    const state = withCar(
      { ...baseState(), activeCarIndex: 0 },
      0,
      { phase: "doorsClosing", destinationFloor: null }
    );
    const next = elevatorReducer(state, { type: "DOORS_CLOSED", carIndex: 0 });

    expect(next.cars[0].phase).toBe("closedWaitingForFloor");
  });

  it("문이 닫힌 채 기다리다가 층 버튼을 누르면 다시 여닫지 않고 곧바로 움직인다", () => {
    const state = withCar(
      { ...baseState(), activeCarIndex: 0 },
      0,
      { phase: "closedWaitingForFloor", carFloor: 1 }
    );
    const next = elevatorReducer(state, { type: "SELECT_FLOOR", floor: 5 });

    expect(next.cars[0].phase).toBe("travelingToDestination");
    expect(next.cars[0].destinationFloor).toBe(5);
    expect(next.cars[0].travelDirection).toBe("up");
    expect(isDoorsOpen(next.cars[0].phase)).toBe(false);
  });

  it("문이 닫힌 채 기다리는 중에도 열림 버튼을 누르면 그냥 지금 층에서 내린다", () => {
    const state = withCar({ ...baseState(), activeCarIndex: 0 }, 0, { phase: "closedWaitingForFloor" });
    const next = elevatorReducer(state, { type: "PRESS_OPEN_DOOR" });

    expect(next.cars[0].phase).toBe("destinationDoorsOpen");
    expect(isDoorsOpen(next.cars[0].phase)).toBe(true);
  });

  it("목적층에 도착하면 문이 열리고 그 층이 새로운 standingFloor가 된다", () => {
    const state = withCar(
      { ...baseState(), activeCarIndex: 0, view: "cabin" },
      0,
      { phase: "travelingToDestination", carFloor: 9, destinationFloor: 10 }
    );
    const next = elevatorReducer(state, { type: "ADVANCE_CAR", carIndex: 0 });

    expect(next.cars[0].phase).toBe("destinationDoorsOpen");
    expect(next.cars[0].carFloor).toBe(10);
    expect(next.standingFloor).toBe(10);
    expect(next.cars[0].destinationFloor).toBeNull();
  });

  it("목적층 문이 열린 채 잠시 지나면 화면은 로비로 바뀌지만 문은 아직 열려 있다", () => {
    const state = withCar(
      { ...baseState(), activeCarIndex: 0, view: "cabin" },
      0,
      { phase: "destinationDoorsOpen" }
    );
    const next = elevatorReducer(state, { type: "ALIGHTED", carIndex: 0 });

    expect(next.cars[0].phase).toBe("alightingDoorsOpen");
    expect(next.view).toBe("lobby");
    expect(isDoorsOpen(next.cars[0].phase)).toBe(true);
  });

  it("로비에서 문이 열려 있다가 시간이 지나면 저절로 닫혀 다시 호출을 받을 수 있다", () => {
    const state = withCar(
      { ...baseState(), activeCarIndex: 0, view: "lobby" },
      0,
      { phase: "alightingDoorsOpen" }
    );
    const next = elevatorReducer(state, { type: "ALIGHTING_DOORS_TIMEOUT", carIndex: 0 });

    expect(next.cars[0].phase).toBe("idle");
    expect(next.view).toBe("lobby");
    expect(next.activeCarIndex).toBeNull();
    expect(next.callActive).toBe(false);
    expect(isDoorsOpen(next.cars[0].phase)).toBe(false);
  });

  it("한 바퀴 전체를 이어서 돌리면 처음과 같은 idle 상태로 돌아온다", () => {
    const afterCall = run(baseState(), { type: "CALL", direction: "up" });
    const boarded = run(
      afterCall,
      { type: "BOARDING_TIMEOUT", carIndex: 0 },
      { type: "SELECT_FLOOR", floor: 5 },
      { type: "PRESS_CLOSE_DOOR" },
      { type: "DOORS_CLOSED", carIndex: 0 }
    );
    const arrived = run(
      boarded,
      { type: "ADVANCE_CAR", carIndex: 0 },
      { type: "ADVANCE_CAR", carIndex: 0 },
      { type: "ADVANCE_CAR", carIndex: 0 },
      { type: "ADVANCE_CAR", carIndex: 0 }
    );
    expect(arrived.cars[0].phase).toBe("destinationDoorsOpen");
    expect(arrived.cars[0].carFloor).toBe(5);

    const backToLobby = run(
      arrived,
      { type: "ALIGHTED", carIndex: 0 },
      { type: "ALIGHTING_DOORS_TIMEOUT", carIndex: 0 }
    );
    expect(backToLobby.cars[0].phase).toBe("idle");
    expect(backToLobby.view).toBe("lobby");
    expect(backToLobby.activeCarIndex).toBeNull();
    expect(backToLobby.standingFloor).toBe(5);
    expect(backToLobby.cars[0].carFloor).toBe(5);
  });

  it("응답 중인 카가 없을 때 캐빈 조작은 상태를 바꾸지 않는다", () => {
    const idleState = baseState();
    expect(elevatorReducer(idleState, { type: "SELECT_FLOOR", floor: 3 })).toBe(idleState);
    expect(elevatorReducer(idleState, { type: "PRESS_CLOSE_DOOR" })).toBe(idleState);
    expect(elevatorReducer(idleState, { type: "PRESS_OPEN_DOOR" })).toBe(idleState);
    expect(elevatorReducer(idleState, { type: "ADVANCE_CAR", carIndex: 0 })).toBe(idleState);
  });

  describe("지하층이 있는 건물", () => {
    it("지하 층 버튼을 고를 수 있고, 0층 없이 1층 바로 아래가 지하 1층이다", () => {
      const state = withCar(
        { ...createInitialElevatorState(10, 3, 1), activeCarIndex: 0 },
        0,
        { phase: "boardingDoorsOpen" }
      );
      const next = elevatorReducer(state, { type: "SELECT_FLOOR", floor: -2 });

      expect(next.cars[0].phase).toBe("closeCountdown");
      expect(next.cars[0].destinationFloor).toBe(-2);
    });

    it("지하 층수를 넘어선 층 버튼은 무시한다", () => {
      const state = withCar(
        { ...createInitialElevatorState(10, 3, 1), activeCarIndex: 0 },
        0,
        { phase: "boardingDoorsOpen" }
      );
      const next = elevatorReducer(state, { type: "SELECT_FLOOR", floor: -4 });

      expect(next).toBe(state);
    });

    it("1층에서 지하로 이동할 때 0층을 거치지 않고 곧바로 지하 1층으로 간다", () => {
      const closed = withCar(
        { ...createInitialElevatorState(10, 3, 1), activeCarIndex: 0 },
        0,
        { phase: "doorsClosing", carFloor: 1, destinationFloor: -2 }
      );
      const traveling = elevatorReducer(closed, { type: "DOORS_CLOSED", carIndex: 0 });
      expect(traveling.cars[0].travelDirection).toBe("down");

      const afterOne = elevatorReducer(traveling, { type: "ADVANCE_CAR", carIndex: 0 });
      expect(afterOne.cars[0].carFloor).toBe(-1);

      const afterTwo = elevatorReducer(afterOne, { type: "ADVANCE_CAR", carIndex: 0 });
      expect(afterTwo.cars[0].carFloor).toBe(-2);
      expect(afterTwo.cars[0].phase).toBe("destinationDoorsOpen");
    });

    it("지하에서 지상으로 이동할 때도 0층을 거치지 않는다", () => {
      const closed = withCar(
        { ...createInitialElevatorState(10, 3, 1), activeCarIndex: 0 },
        0,
        { phase: "doorsClosing", carFloor: -1, destinationFloor: 2 }
      );
      const traveling = elevatorReducer(closed, { type: "DOORS_CLOSED", carIndex: 0 });
      expect(traveling.cars[0].travelDirection).toBe("up");

      const afterOne = elevatorReducer(traveling, { type: "ADVANCE_CAR", carIndex: 0 });
      expect(afterOne.cars[0].carFloor).toBe(1);

      const afterTwo = elevatorReducer(afterOne, { type: "ADVANCE_CAR", carIndex: 0 });
      expect(afterTwo.cars[0].carFloor).toBe(2);
      expect(afterTwo.cars[0].phase).toBe("destinationDoorsOpen");
    });
  });
});

describe("elevatorReducer — 여러 대 배차", () => {
  it("idle한 카가 여럿이면 층 거리가 가장 가까운 카가 응답한다", () => {
    let state = { ...baseState(2), standingFloor: 1 };
    state = withCar(state, 0, { carFloor: 5 });
    state = withCar(state, 1, { carFloor: 2 });

    const next = elevatorReducer(state, { type: "CALL", direction: "down" });

    expect(next.activeCarIndex).toBe(1);
    expect(next.cars[1].phase).toBe("travelingToPickup");
    expect(next.cars[0].phase).toBe("idle");
  });

  it("층 거리가 같으면 번호가 빠른 카가 응답한다", () => {
    let state = { ...baseState(2), standingFloor: 1 };
    state = withCar(state, 0, { carFloor: 3 });
    state = withCar(state, 1, { carFloor: -1 });

    const next = elevatorReducer(state, { type: "CALL", direction: "up" });

    expect(next.activeCarIndex).toBe(0);
  });

  it("이미 응답 중인 카가 있으면 새 호출은 무시한다", () => {
    const state = { ...baseState(2), activeCarIndex: 0, callActive: true };
    const next = elevatorReducer(state, { type: "CALL", direction: "up" });

    expect(next).toBe(state);
  });

  it("idle한 카가 하나도 없으면 가장 가까운 카가 이동 중이던 목적지를 버리고 호출한 층으로 향한다", () => {
    let state = { ...baseState(2), standingFloor: 1 };
    state = withCar(state, 0, {
      carFloor: 6,
      phase: "travelingToDestination",
      destinationFloor: 9,
      travelDirection: "up",
    });
    state = withCar(state, 1, {
      carFloor: 3,
      phase: "travelingToDestination",
      destinationFloor: 8,
      travelDirection: "up",
    });

    const next = elevatorReducer(state, { type: "CALL", direction: "down" });

    // 층 거리 기준으로 카1(층3)이 카0(층6)보다 가깝다.
    expect(next.activeCarIndex).toBe(1);
    expect(next.cars[1].phase).toBe("travelingToPickup");
    expect(next.cars[1].destinationFloor).toBeNull();
    // 재배차되어도 층 사이에서 순간적으로 방향이 바뀌지 않고, 다음 층 도착까지는
    // carFloor가 그대로다.
    expect(next.cars[1].carFloor).toBe(3);
    // 나머지 카는 방해받지 않고 하던 자율 운행을 그대로 이어간다.
    expect(next.cars[0].phase).toBe("travelingToDestination");
    expect(next.cars[0].destinationFloor).toBe(9);
  });

  it("문이 열려 있던 자율 운행 카가 재배차되면, 문 동작은 그대로 이어가되 태우러 갈 예정으로 표시된다", () => {
    // 두 카 모두 idle이 아니어야(자율 운행 중이어야) 재배차 경로를 탄다.
    let state = { ...baseState(2), standingFloor: 5 };
    state = withCar(state, 0, { carFloor: 1, phase: "boardingDoorsOpen", destinationFloor: 8 });
    state = withCar(state, 1, {
      carFloor: 9,
      phase: "travelingToDestination",
      destinationFloor: 2,
      travelDirection: "down",
    });

    const next = elevatorReducer(state, { type: "CALL", direction: "down" });

    // 층 거리 기준으로 카0(층1)이 카1(층9)보다 가깝다. 문이 열려 있던
    // 그림이 갑자기 끊기지 않도록 phase는 boardingDoorsOpen 그대로 두고,
    // 원래 목적지(8층)는 지운 뒤 pickup을 예약해 둔다.
    expect(next.activeCarIndex).toBe(0);
    expect(next.cars[0].phase).toBe("boardingDoorsOpen");
    expect(next.cars[0].destinationFloor).toBeNull();
    expect(next.cars[0].awaitingPickup).toBe(true);
    expect(isDoorsOpen(next.cars[0].phase)).toBe(true);
    // 카0은 아직 standingFloor(5)에 있는 게 아니라 원래 있던 층(1)에서
    // 문이 열려 있을 뿐이므로, 아이는 아직 기다리는 중이다.
    expect(next.callActive).toBe(true);
  });

  it("재배차된 카는 문을 마저 닫은 뒤 실제로 호출한 층을 향해 출발한다", () => {
    // 문이 열려 있던 채로 재배차된 카(awaitingPickup)가 문을 닫은 뒤
    // 원래 자율 운행 목적지가 아니라 standingFloor로 향해야 한다. phase
    // 하나로는 이 구분이 안 되어 있던 게 실제 버그였다.
    let state = { ...baseState(1), standingFloor: 1 };
    state = withCar(state, 0, { carFloor: 4, phase: "boardingDoorsOpen", destinationFloor: 8 });

    const redirected = elevatorReducer(state, { type: "CALL", direction: "up" });
    const doorsClosing = elevatorReducer(redirected, { type: "AUTO_CLOSE_TIMEOUT", carIndex: 0 });
    const traveling = elevatorReducer(doorsClosing, { type: "DOORS_CLOSED", carIndex: 0 });

    expect(traveling.cars[0].phase).toBe("travelingToPickup");
    expect(traveling.cars[0].awaitingPickup).toBe(false);
    expect(traveling.cars[0].travelDirection).toBe("down");

    const arrived = elevatorReducer(traveling, { type: "ADVANCE_CAR", carIndex: 0 });
    const afterAll = [2, 3].reduce(
      (s) => elevatorReducer(s, { type: "ADVANCE_CAR", carIndex: 0 }),
      arrived
    );

    expect(afterAll.cars[0].phase).toBe("pickupDoorsOpen");
    expect(afterAll.cars[0].carFloor).toBe(1);
  });

  it("문이 닫히는 중이던 카가 재배차되면 그대로 닫힌 뒤 호출한 층으로 향한다", () => {
    let state = { ...baseState(1), standingFloor: 1 };
    state = withCar(state, 0, { carFloor: 6, phase: "doorsClosing", destinationFloor: 9 });

    const redirected = elevatorReducer(state, { type: "CALL", direction: "up" });
    expect(redirected.cars[0].phase).toBe("doorsClosing");
    expect(redirected.cars[0].awaitingPickup).toBe(true);

    const traveling = elevatorReducer(redirected, { type: "DOORS_CLOSED", carIndex: 0 });
    expect(traveling.cars[0].phase).toBe("travelingToPickup");
    expect(traveling.cars[0].travelDirection).toBe("down");
  });

  it("이동 중이던 카가 마침 호출한 층에 있으면 엉뚱한 방향으로 새지 않고 곧바로 응답한다", () => {
    // carFloor === standingFloor인 채로 이동 중(travelingToDestination)인
    // 카가 재배차되면, directionTo(같은 층, 같은 층)이 null이 되어
    // ADVANCE_CAR가 "내려가는 중"으로 오판해 한 층 내려갔다 올라오는
    // 회귀가 있었다.
    let state = { ...baseState(1), standingFloor: 5 };
    state = withCar(state, 0, {
      carFloor: 5,
      phase: "travelingToDestination",
      destinationFloor: 8,
      travelDirection: "up",
    });

    const redirected = elevatorReducer(state, { type: "CALL", direction: "up" });
    expect(redirected.cars[0].phase).toBe("pickupDoorsOpen");
    expect(redirected.cars[0].carFloor).toBe(5);
    expect(redirected.callActive).toBe(false);
  });

  it("재배차된 카가 호출한 층에 도착하면 목적지 안내가 아니라 태우러 온 상태로 문을 연다", () => {
    let state = { ...baseState(1), standingFloor: 4 };
    state = withCar(state, 0, {
      carFloor: 5,
      phase: "travelingToDestination",
      destinationFloor: 9,
      travelDirection: "up",
    });
    const redirected = elevatorReducer(state, { type: "CALL", direction: "down" });

    const arrived = elevatorReducer(redirected, { type: "ADVANCE_CAR", carIndex: 0 });

    expect(arrived.cars[0].phase).toBe("pickupDoorsOpen");
    expect(arrived.cars[0].carFloor).toBe(4);
    expect(arrived.callActive).toBe(false);
  });
});

describe("elevatorReducer — 자율 운행", () => {
  it("idle한 카는 스스로 목적층을 정해 곧장 문을 열고, 그 목적층을 미리 기억해 둔다", () => {
    const state = baseState(2);
    const next = elevatorReducer(state, { type: "AUTO_DEPART", carIndex: 1, destinationFloor: 6 });

    expect(next.cars[1].phase).toBe("pickupDoorsOpen");
    expect(next.cars[1].destinationFloor).toBe(6);
    expect(next.cars[0].phase).toBe("idle");
  });

  it("idle이 아닌 카에는 자율 운행이 새로 시작되지 않는다", () => {
    const state = withCar(baseState(1), 0, { phase: "boardingDoorsOpen" });
    const next = elevatorReducer(state, { type: "AUTO_DEPART", carIndex: 0, destinationFloor: 6 });

    expect(next).toBe(state);
  });

  it("자기가 있는 층으로는 자율 운행을 시작하지 않는다", () => {
    const state = baseState(1);
    const next = elevatorReducer(state, { type: "AUTO_DEPART", carIndex: 0, destinationFloor: 1 });

    expect(next).toBe(state);
  });

  it("자율 운행 카가 목적지에 도착해도 아이가 서 있는 층은 바뀌지 않는다", () => {
    let state: ElevatorState = { ...baseState(2), standingFloor: 1, activeCarIndex: null };
    state = withCar(state, 1, { carFloor: 5, phase: "travelingToDestination", destinationFloor: 6 });

    const next = elevatorReducer(state, { type: "ADVANCE_CAR", carIndex: 1 });

    expect(next.cars[1].phase).toBe("destinationDoorsOpen");
    expect(next.cars[1].carFloor).toBe(6);
    expect(next.standingFloor).toBe(1);
  });

  it("자율 운행 카는 한 바퀴를 마치면 다시 idle로 돌아가 자율 운행 후보가 된다", () => {
    let state: ElevatorState = { ...baseState(2), activeCarIndex: null };
    state = withCar(state, 1, { phase: "alightingDoorsOpen" });

    const next = elevatorReducer(state, { type: "ALIGHTING_DOORS_TIMEOUT", carIndex: 1 });

    expect(next.cars[1].phase).toBe("idle");
    expect(next.activeCarIndex).toBeNull();
  });
});
