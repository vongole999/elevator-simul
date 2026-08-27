"use client";

import { useEffect, useReducer } from "react";

import {
  ALIGHTING_DOOR_WAIT_MS,
  DOOR_ANIMATION_MS,
  DOORS_OPEN_WAIT_MS,
  FLOOR_TRAVEL_MS,
} from "./constants";
import { formatFloorSpeech } from "./floor-format";
import { playArrivalChime, primeGuidanceAudio, speak } from "./guidance-sound";
import { createInitialElevatorState, elevatorReducer, isCarTraveling } from "./machine";
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
 * 진입했을 때 필요한 타이머 예약과 안내 소리 재생만 담당한다. topFloor·
 * bottomFloor는 이 훅을 처음 마운트할 때의 건물 크기로 고정된다 — 다른
 * 건물로 바꾸려면 호출하는 쪽에서 컴포넌트를 다시 마운트한다.
 */
export function useElevator(topFloor: number, bottomFloor: number): UseElevatorResult {
  const [state, dispatch] = useReducer(
    elevatorReducer,
    { topFloor, bottomFloor },
    ({ topFloor, bottomFloor }) => createInitialElevatorState(topFloor, bottomFloor)
  );

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
      case "boardingDoorsOpen":
      case "closeCountdown": {
        // 층 버튼을 고르지 않고 방치해도(boardingDoorsOpen), 골라서 기다리는
        // 중이어도(closeCountdown) 시간이 지나면 저절로 닫히기 시작한다.
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
        speak(`${formatFloorSpeech(state.standingFloor)}입니다`);
        speak("문이 열립니다");
        const timer = window.setTimeout(
          () => dispatch({ type: "ALIGHTED" }),
          DOORS_OPEN_WAIT_MS
        );
        return () => window.clearTimeout(timer);
      }
      case "alightingDoorsOpen": {
        // 아이가 이미 내렸으니 별도 조작 없이 저절로 닫힌다.
        speak("문이 닫힙니다");
        const timer = window.setTimeout(
          () => dispatch({ type: "ALIGHTING_DOORS_TIMEOUT" }),
          ALIGHTING_DOOR_WAIT_MS
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
