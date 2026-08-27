"use client";

import { useEffect, useReducer } from "react";

import { DOOR_ANIMATION_MS, DOORS_OPEN_WAIT_MS, FLOOR_TRAVEL_MS } from "./constants";
import { playArrivalChime, primeGuidanceAudio, speak } from "./guidance-sound";
import { elevatorReducer, initialElevatorState, isCarTraveling } from "./machine";
import type { Direction, ElevatorState } from "./types";

export interface UseElevatorResult {
  state: ElevatorState;
  call: (direction: Direction) => void;
  selectFloor: (floor: number) => void;
  pressOpenDoor: () => void;
  pressCloseDoor: () => void;
}

/**
 * 엘리베이터 한 바퀴의 상태 기계를 굴린다.
 *
 * 상태 전이 자체는 순수 함수인 elevatorReducer가 맡고, 이 훅은 각 단계에
 * 진입했을 때 필요한 타이머 예약과 안내 소리 재생만 담당한다.
 */
export function useElevator(): UseElevatorResult {
  const [state, dispatch] = useReducer(elevatorReducer, initialElevatorState);

  // 단계에 처음 들어설 때 한 번만 일어나는 안내 소리와 대기 타이머.
  useEffect(() => {
    switch (state.phase) {
      case "pickupDoorsOpen": {
        playArrivalChime();
        speak("문이 열립니다");
        const timer = window.setTimeout(
          () => dispatch({ type: "BOARDING_TIMEOUT" }),
          DOORS_OPEN_WAIT_MS
        );
        return () => window.clearTimeout(timer);
      }
      case "closeCountdown": {
        const timer = window.setTimeout(
          () => dispatch({ type: "AUTO_CLOSE_TIMEOUT" }),
          DOORS_OPEN_WAIT_MS
        );
        return () => window.clearTimeout(timer);
      }
      case "doorsClosing": {
        speak("문이 닫힙니다");
        const timer = window.setTimeout(
          () => dispatch({ type: "DOORS_CLOSED" }),
          DOOR_ANIMATION_MS
        );
        return () => window.clearTimeout(timer);
      }
      case "travelingToDestination": {
        if (state.travelDirection) {
          speak(state.travelDirection === "up" ? "올라갑니다" : "내려갑니다");
        }
        return;
      }
      case "destinationDoorsOpen": {
        playArrivalChime();
        speak(`${state.standingFloor}층입니다`);
        speak("문이 열립니다");
        const timer = window.setTimeout(
          () => dispatch({ type: "ALIGHTING_TIMEOUT" }),
          DOORS_OPEN_WAIT_MS
        );
        return () => window.clearTimeout(timer);
      }
      default:
        return;
    }
  }, [state.phase, state.travelDirection, state.standingFloor]);

  // 이동 중에는 한 층 지날 때마다 다음 한 층을 다시 예약한다.
  useEffect(() => {
    if (!isCarTraveling(state.phase)) return;
    const timer = window.setTimeout(() => dispatch({ type: "ADVANCE_CAR" }), FLOOR_TRAVEL_MS);
    return () => window.clearTimeout(timer);
  }, [state.phase, state.carFloor]);

  function call(direction: Direction) {
    primeGuidanceAudio();
    dispatch({ type: "CALL", direction });
  }

  function selectFloor(floor: number) {
    dispatch({ type: "SELECT_FLOOR", floor });
  }

  function pressOpenDoor() {
    dispatch({ type: "PRESS_OPEN_DOOR" });
  }

  function pressCloseDoor() {
    dispatch({ type: "PRESS_CLOSE_DOOR" });
  }

  return { state, call, selectFloor, pressOpenDoor, pressCloseDoor };
}
