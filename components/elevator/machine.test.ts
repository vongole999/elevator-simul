import { describe, expect, it } from "vitest";

import { createInitialElevatorState, elevatorReducer, isDoorsOpen } from "./machine";
import type { ElevatorState } from "./types";

function run(state: ElevatorState, ...actions: Parameters<typeof elevatorReducer>[1][]) {
  return actions.reduce(elevatorReducer, state);
}

/** 지상 10층·지하 없는 건물의 처음 상태. 대부분의 테스트가 이걸 기준으로 삼는다. */
function baseState(): ElevatorState {
  return createInitialElevatorState(10, 0);
}

describe("elevatorReducer", () => {
  it("카가 이미 아이가 서 있는 층에 있으면 호출 즉시 문이 열리는 단계로 간다", () => {
    const next = elevatorReducer(baseState(), { type: "CALL", direction: "up" });

    expect(next.phase).toBe("pickupDoorsOpen");
    expect(next.callActive).toBe(false);
  });

  it("카가 다른 층에 있으면 호출 시 이동을 시작하고 호출 버튼이 켜진다", () => {
    const state: ElevatorState = { ...baseState(), carFloor: 5, standingFloor: 1 };
    const next = elevatorReducer(state, { type: "CALL", direction: "down" });

    expect(next.phase).toBe("travelingToPickup");
    expect(next.callActive).toBe(true);
    expect(next.travelDirection).toBe("down");
  });

  it("이동 중에는 한 층씩 전진하고, 지나는 층마다 carFloor가 바뀐다", () => {
    const state: ElevatorState = { ...baseState(), carFloor: 1, standingFloor: 3, phase: "travelingToPickup" };

    const afterOne = elevatorReducer(state, { type: "ADVANCE_CAR" });
    expect(afterOne.carFloor).toBe(2);
    expect(afterOne.phase).toBe("travelingToPickup");

    const afterTwo = elevatorReducer(afterOne, { type: "ADVANCE_CAR" });
    expect(afterTwo.carFloor).toBe(3);
    expect(afterTwo.phase).toBe("pickupDoorsOpen");
    expect(afterTwo.callActive).toBe(false);
  });

  it("승차 대기가 끝나면 안쪽 시점으로 바뀐다", () => {
    const state: ElevatorState = { ...baseState(), phase: "pickupDoorsOpen" };
    const next = elevatorReducer(state, { type: "BOARDING_TIMEOUT" });

    expect(next.view).toBe("cabin");
    expect(next.phase).toBe("boardingDoorsOpen");
  });

  it("지금 있는 층 버튼은 눌러도 무시한다", () => {
    const state: ElevatorState = { ...baseState(), phase: "boardingDoorsOpen", carFloor: 4 };
    const next = elevatorReducer(state, { type: "SELECT_FLOOR", floor: 4 });

    expect(next).toBe(state);
  });

  it("건물 범위 밖 층 버튼은 무시한다", () => {
    const state: ElevatorState = { ...baseState(), phase: "boardingDoorsOpen" };

    expect(elevatorReducer(state, { type: "SELECT_FLOOR", floor: 11 })).toBe(state);
    expect(elevatorReducer(state, { type: "SELECT_FLOOR", floor: 0 })).toBe(state);
  });

  it("층 버튼을 누르면 그 버튼이 켜지고 자동 닫힘 대기로 들어간다", () => {
    const state: ElevatorState = { ...baseState(), phase: "boardingDoorsOpen", carFloor: 1 };
    const next = elevatorReducer(state, { type: "SELECT_FLOOR", floor: 7 });

    expect(next.phase).toBe("closeCountdown");
    expect(next.destinationFloor).toBe(7);
  });

  it("층 버튼을 고르지 않고 방치해도 시간이 지나면 저절로 닫히기 시작한다", () => {
    const state: ElevatorState = { ...baseState(), phase: "boardingDoorsOpen" };
    const next = elevatorReducer(state, { type: "AUTO_CLOSE_TIMEOUT" });

    expect(next.phase).toBe("doorsClosing");
    expect(next.destinationFloor).toBeNull();
  });

  it("목적층을 고르기 전에도 닫힘 버튼을 누르면 바로 닫히기 시작한다", () => {
    const state: ElevatorState = { ...baseState(), phase: "boardingDoorsOpen", destinationFloor: null };
    const next = elevatorReducer(state, { type: "PRESS_CLOSE_DOOR" });

    expect(next.phase).toBe("doorsClosing");
  });

  it("닫힘 버튼을 누르면 기다림 없이 바로 닫히기 시작한다", () => {
    const state: ElevatorState = { ...baseState(), phase: "closeCountdown", destinationFloor: 7 };
    const next = elevatorReducer(state, { type: "PRESS_CLOSE_DOOR" });

    expect(next.phase).toBe("doorsClosing");
  });

  it("자동 닫힘 대기 시간이 지나면 저절로 닫히기 시작한다", () => {
    const state: ElevatorState = { ...baseState(), phase: "closeCountdown", destinationFloor: 7 };
    const next = elevatorReducer(state, { type: "AUTO_CLOSE_TIMEOUT" });

    expect(next.phase).toBe("doorsClosing");
  });

  it("닫히는 중 열림 버튼을 누르면 다시 열리고 기다림이 처음부터 시작된다", () => {
    const state: ElevatorState = { ...baseState(), phase: "doorsClosing", destinationFloor: 7 };
    const next = elevatorReducer(state, { type: "PRESS_OPEN_DOOR" });

    expect(next.phase).toBe("closeCountdown");
    expect(isDoorsOpen(next.phase)).toBe(true);
  });

  it("목적층 없이 닫힌 뒤 열림 버튼을 누르면 층 버튼을 다시 고를 수 있는 상태로 열린다", () => {
    const state: ElevatorState = { ...baseState(), phase: "doorsClosing", destinationFloor: null };
    const next = elevatorReducer(state, { type: "PRESS_OPEN_DOOR" });

    expect(next.phase).toBe("boardingDoorsOpen");
  });

  it("문이 닫히면 목적층 방향으로 이동을 시작한다", () => {
    const state: ElevatorState = { ...baseState(), phase: "doorsClosing", carFloor: 3, destinationFloor: 1 };
    const next = elevatorReducer(state, { type: "DOORS_CLOSED" });

    expect(next.phase).toBe("travelingToDestination");
    expect(next.travelDirection).toBe("down");
  });

  it("목적층 없이 문이 닫히면 그 자리에 선 채 층 버튼을 기다린다", () => {
    const state: ElevatorState = { ...baseState(), phase: "doorsClosing", destinationFloor: null };
    const next = elevatorReducer(state, { type: "DOORS_CLOSED" });

    expect(next.phase).toBe("closedWaitingForFloor");
  });

  it("문이 닫힌 채 기다리다가 층 버튼을 누르면 다시 여닫지 않고 곧바로 움직인다", () => {
    const state: ElevatorState = { ...baseState(), phase: "closedWaitingForFloor", carFloor: 1 };
    const next = elevatorReducer(state, { type: "SELECT_FLOOR", floor: 5 });

    expect(next.phase).toBe("travelingToDestination");
    expect(next.destinationFloor).toBe(5);
    expect(next.travelDirection).toBe("up");
    expect(isDoorsOpen(next.phase)).toBe(false);
  });

  it("문이 닫힌 채 기다리는 중에도 열림 버튼을 누르면 다시 열어 준다", () => {
    const state: ElevatorState = { ...baseState(), phase: "closedWaitingForFloor" };
    const next = elevatorReducer(state, { type: "PRESS_OPEN_DOOR" });

    expect(next.phase).toBe("boardingDoorsOpen");
    expect(isDoorsOpen(next.phase)).toBe(true);
  });

  it("목적층에 도착하면 문이 열리고 그 층이 새로운 standingFloor가 된다", () => {
    const state: ElevatorState = {
      ...baseState(),
      phase: "travelingToDestination",
      carFloor: 9,
      destinationFloor: 10,
      view: "cabin",
    };
    const next = elevatorReducer(state, { type: "ADVANCE_CAR" });

    expect(next.phase).toBe("destinationDoorsOpen");
    expect(next.carFloor).toBe(10);
    expect(next.standingFloor).toBe(10);
    expect(next.destinationFloor).toBeNull();
  });

  it("목적층 문이 열린 채 잠시 지나면 화면은 로비로 바뀌지만 문은 아직 열려 있다", () => {
    const state: ElevatorState = { ...baseState(), phase: "destinationDoorsOpen", view: "cabin" };
    const next = elevatorReducer(state, { type: "ALIGHTED" });

    expect(next.phase).toBe("alightingDoorsOpen");
    expect(next.view).toBe("lobby");
    expect(isDoorsOpen(next.phase)).toBe(true);
  });

  it("로비에서 문이 열려 있다가 시간이 지나면 저절로 닫혀 다시 호출을 받을 수 있다", () => {
    const state: ElevatorState = { ...baseState(), phase: "alightingDoorsOpen", view: "lobby" };
    const next = elevatorReducer(state, { type: "ALIGHTING_DOORS_TIMEOUT" });

    expect(next.phase).toBe("idle");
    expect(next.view).toBe("lobby");
    expect(isDoorsOpen(next.phase)).toBe(false);
  });

  it("한 바퀴 전체를 이어서 돌리면 처음과 같은 idle 상태로 돌아온다", () => {
    const afterCall = run(baseState(), { type: "CALL", direction: "up" });
    const boarded = run(
      afterCall,
      { type: "BOARDING_TIMEOUT" },
      { type: "SELECT_FLOOR", floor: 5 },
      { type: "PRESS_CLOSE_DOOR" },
      { type: "DOORS_CLOSED" }
    );
    const arrived = run(
      boarded,
      { type: "ADVANCE_CAR" },
      { type: "ADVANCE_CAR" },
      { type: "ADVANCE_CAR" },
      { type: "ADVANCE_CAR" }
    );
    expect(arrived.phase).toBe("destinationDoorsOpen");
    expect(arrived.carFloor).toBe(5);

    const backToLobby = run(
      arrived,
      { type: "ALIGHTED" },
      { type: "ALIGHTING_DOORS_TIMEOUT" }
    );
    expect(backToLobby.phase).toBe("idle");
    expect(backToLobby.view).toBe("lobby");
    expect(backToLobby.standingFloor).toBe(5);
    expect(backToLobby.carFloor).toBe(5);
  });

  it("phase에 맞지 않는 조작은 상태를 바꾸지 않는다", () => {
    const idleState = { ...baseState(), phase: "idle" as const };
    expect(elevatorReducer(idleState, { type: "SELECT_FLOOR", floor: 3 })).toBe(idleState);
    expect(elevatorReducer(idleState, { type: "PRESS_CLOSE_DOOR" })).toBe(idleState);
    expect(elevatorReducer(idleState, { type: "PRESS_OPEN_DOOR" })).toBe(idleState);
    expect(elevatorReducer(idleState, { type: "ADVANCE_CAR" })).toBe(idleState);
  });

  describe("지하층이 있는 건물", () => {
    it("지하 층 버튼을 고를 수 있고, 0층 없이 1층 바로 아래가 지하 1층이다", () => {
      const state: ElevatorState = { ...createInitialElevatorState(10, 3), phase: "boardingDoorsOpen" };
      const next = elevatorReducer(state, { type: "SELECT_FLOOR", floor: -2 });

      expect(next.phase).toBe("closeCountdown");
      expect(next.destinationFloor).toBe(-2);
    });

    it("지하 층수를 넘어선 층 버튼은 무시한다", () => {
      const state: ElevatorState = { ...createInitialElevatorState(10, 3), phase: "boardingDoorsOpen" };
      const next = elevatorReducer(state, { type: "SELECT_FLOOR", floor: -4 });

      expect(next).toBe(state);
    });

    it("1층에서 지하로 이동할 때 0층을 거치지 않고 곧바로 지하 1층으로 간다", () => {
      const closed: ElevatorState = {
        ...createInitialElevatorState(10, 3),
        phase: "doorsClosing",
        carFloor: 1,
        destinationFloor: -2,
      };
      const traveling = elevatorReducer(closed, { type: "DOORS_CLOSED" });
      expect(traveling.travelDirection).toBe("down");

      const afterOne = elevatorReducer(traveling, { type: "ADVANCE_CAR" });
      expect(afterOne.carFloor).toBe(-1);

      const afterTwo = elevatorReducer(afterOne, { type: "ADVANCE_CAR" });
      expect(afterTwo.carFloor).toBe(-2);
      expect(afterTwo.phase).toBe("destinationDoorsOpen");
    });

    it("지하에서 지상으로 이동할 때도 0층을 거치지 않는다", () => {
      const closed: ElevatorState = {
        ...createInitialElevatorState(10, 3),
        phase: "doorsClosing",
        carFloor: -1,
        destinationFloor: 2,
      };
      const traveling = elevatorReducer(closed, { type: "DOORS_CLOSED" });
      expect(traveling.travelDirection).toBe("up");

      const afterOne = elevatorReducer(traveling, { type: "ADVANCE_CAR" });
      expect(afterOne.carFloor).toBe(1);

      const afterTwo = elevatorReducer(afterOne, { type: "ADVANCE_CAR" });
      expect(afterTwo.carFloor).toBe(2);
      expect(afterTwo.phase).toBe("destinationDoorsOpen");
    });
  });
});
