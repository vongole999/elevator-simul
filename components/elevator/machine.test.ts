import { describe, expect, it } from "vitest";

import { elevatorReducer, initialElevatorState, isDoorsOpen } from "./machine";
import type { ElevatorState } from "./types";

function run(state: ElevatorState, ...actions: Parameters<typeof elevatorReducer>[1][]) {
  return actions.reduce(elevatorReducer, state);
}

describe("elevatorReducer", () => {
  it("카가 이미 아이가 서 있는 층에 있으면 호출 즉시 문이 열리는 단계로 간다", () => {
    const next = elevatorReducer(initialElevatorState, { type: "CALL", direction: "up" });

    expect(next.phase).toBe("pickupDoorsOpen");
    expect(next.callActive).toBe(false);
  });

  it("카가 다른 층에 있으면 호출 시 이동을 시작하고 호출 버튼이 켜진다", () => {
    const state: ElevatorState = { ...initialElevatorState, carFloor: 5, standingFloor: 1 };
    const next = elevatorReducer(state, { type: "CALL", direction: "down" });

    expect(next.phase).toBe("travelingToPickup");
    expect(next.callActive).toBe(true);
    expect(next.travelDirection).toBe("down");
  });

  it("이동 중에는 한 층씩 전진하고, 지나는 층마다 carFloor가 바뀐다", () => {
    const state: ElevatorState = { ...initialElevatorState, carFloor: 1, standingFloor: 3, phase: "travelingToPickup" };

    const afterOne = elevatorReducer(state, { type: "ADVANCE_CAR" });
    expect(afterOne.carFloor).toBe(2);
    expect(afterOne.phase).toBe("travelingToPickup");

    const afterTwo = elevatorReducer(afterOne, { type: "ADVANCE_CAR" });
    expect(afterTwo.carFloor).toBe(3);
    expect(afterTwo.phase).toBe("pickupDoorsOpen");
    expect(afterTwo.callActive).toBe(false);
  });

  it("승차 대기가 끝나면 안쪽 시점으로 바뀐다", () => {
    const state: ElevatorState = { ...initialElevatorState, phase: "pickupDoorsOpen" };
    const next = elevatorReducer(state, { type: "BOARDING_TIMEOUT" });

    expect(next.view).toBe("cabin");
    expect(next.phase).toBe("boardingDoorsOpen");
  });

  it("지금 있는 층 버튼은 눌러도 무시한다", () => {
    const state: ElevatorState = { ...initialElevatorState, phase: "boardingDoorsOpen", carFloor: 4 };
    const next = elevatorReducer(state, { type: "SELECT_FLOOR", floor: 4 });

    expect(next).toBe(state);
  });

  it("층 버튼을 누르면 그 버튼이 켜지고 자동 닫힘 대기로 들어간다", () => {
    const state: ElevatorState = { ...initialElevatorState, phase: "boardingDoorsOpen", carFloor: 1 };
    const next = elevatorReducer(state, { type: "SELECT_FLOOR", floor: 7 });

    expect(next.phase).toBe("closeCountdown");
    expect(next.destinationFloor).toBe(7);
  });

  it("목적층을 고르기 전에는 닫힘 버튼이 듣지 않는다", () => {
    const state: ElevatorState = { ...initialElevatorState, phase: "boardingDoorsOpen", destinationFloor: null };
    const next = elevatorReducer(state, { type: "PRESS_CLOSE_DOOR" });

    expect(next).toBe(state);
  });

  it("닫힘 버튼을 누르면 기다림 없이 바로 닫히기 시작한다", () => {
    const state: ElevatorState = { ...initialElevatorState, phase: "closeCountdown", destinationFloor: 7 };
    const next = elevatorReducer(state, { type: "PRESS_CLOSE_DOOR" });

    expect(next.phase).toBe("doorsClosing");
  });

  it("자동 닫힘 대기 시간이 지나면 저절로 닫히기 시작한다", () => {
    const state: ElevatorState = { ...initialElevatorState, phase: "closeCountdown", destinationFloor: 7 };
    const next = elevatorReducer(state, { type: "AUTO_CLOSE_TIMEOUT" });

    expect(next.phase).toBe("doorsClosing");
  });

  it("닫히는 중 열림 버튼을 누르면 다시 열리고 기다림이 처음부터 시작된다", () => {
    const state: ElevatorState = { ...initialElevatorState, phase: "doorsClosing", destinationFloor: 7 };
    const next = elevatorReducer(state, { type: "PRESS_OPEN_DOOR" });

    expect(next.phase).toBe("closeCountdown");
    expect(isDoorsOpen(next.phase)).toBe(true);
  });

  it("문이 닫히면 목적층 방향으로 이동을 시작한다", () => {
    const state: ElevatorState = { ...initialElevatorState, phase: "doorsClosing", carFloor: 3, destinationFloor: 1 };
    const next = elevatorReducer(state, { type: "DOORS_CLOSED" });

    expect(next.phase).toBe("travelingToDestination");
    expect(next.travelDirection).toBe("down");
  });

  it("목적층에 도착하면 문이 열리고 그 층이 새로운 standingFloor가 된다", () => {
    const state: ElevatorState = {
      ...initialElevatorState,
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

  it("하차 대기가 끝나면 바깥 시점으로 돌아가 다시 호출을 받을 수 있다", () => {
    const state: ElevatorState = { ...initialElevatorState, phase: "destinationDoorsOpen", view: "cabin" };
    const next = elevatorReducer(state, { type: "ALIGHTING_TIMEOUT" });

    expect(next.phase).toBe("idle");
    expect(next.view).toBe("lobby");
  });

  it("한 바퀴 전체를 이어서 돌리면 처음과 같은 idle 상태로 돌아온다", () => {
    const afterCall = run(
      { ...initialElevatorState, carFloor: 1, standingFloor: 1 },
      { type: "CALL", direction: "up" }
    );
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

    const backToLobby = elevatorReducer(arrived, { type: "ALIGHTING_TIMEOUT" });
    expect(backToLobby.phase).toBe("idle");
    expect(backToLobby.view).toBe("lobby");
    expect(backToLobby.standingFloor).toBe(5);
    expect(backToLobby.carFloor).toBe(5);
  });

  it("phase에 맞지 않는 조작은 상태를 바꾸지 않는다", () => {
    const idleState = { ...initialElevatorState, phase: "idle" as const };
    expect(elevatorReducer(idleState, { type: "SELECT_FLOOR", floor: 3 })).toBe(idleState);
    expect(elevatorReducer(idleState, { type: "PRESS_CLOSE_DOOR" })).toBe(idleState);
    expect(elevatorReducer(idleState, { type: "PRESS_OPEN_DOOR" })).toBe(idleState);
    expect(elevatorReducer(idleState, { type: "ADVANCE_CAR" })).toBe(idleState);
  });
});
