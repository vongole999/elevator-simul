"use client";

import { useReducer } from "react";

import { floorSelectedPhrase } from "./guidance-phrases";
import { primeGuidanceAudio, speak } from "./guidance-sound";
import { createInitialElevatorState, elevatorReducer } from "./machine";
import type { Direction, ElevatorAction, ElevatorState, Language } from "./types";

export interface UseElevatorResult {
  state: ElevatorState;
  dispatch: React.Dispatch<ElevatorAction>;
  call: (direction: Direction) => void;
  selectFloor: (floor: number) => void;
  pressOpenDoor: () => void;
  pressCloseDoor: () => void;
}

/**
 * 여러 대 엘리베이터 상태 기계의 reducer와 아이가 쓰는 조작 콜백만 관리한다.
 *
 * 상태 전이 자체는 순수 함수인 elevatorReducer가 맡는다. 카마다 필요한
 * 타이머 예약과 안내 소리 재생은 이 훅이 아니라 CarLifecycle 컴포넌트가
 * 카 개수만큼 인스턴스화되어 각자 담당한다 — 대수가 가변적이라 훅 하나로
 * 고정 개수의 useEffect를 두는 방식은 쓸 수 없기 때문이다.
 *
 * topFloor·bottomFloor·carCount는 이 훅을 처음 마운트할 때의 값으로
 * 고정된다 — 다른 건물로 바꾸려면 호출하는 쪽에서 컴포넌트를 다시
 * 마운트한다.
 */
export function useElevator(
  topFloor: number,
  bottomFloor: number,
  carCount: number,
  language: Language
): UseElevatorResult {
  const [state, dispatch] = useReducer(
    elevatorReducer,
    { topFloor, bottomFloor, carCount },
    ({ topFloor, bottomFloor, carCount }) => createInitialElevatorState(topFloor, bottomFloor, carCount)
  );

  function call(direction: Direction) {
    primeGuidanceAudio();
    dispatch({ type: "CALL", direction });
  }

  function selectFloor(floor: number) {
    // 버튼을 누른 층 버튼이 disabled가 아닐 때만 이 함수가 불리므로(cabin-scene.tsx),
    // 항상 유효한 선택이다 — 무효한 선택을 걸러내는 검사는 reducer 쪽에 이미 있다.
    speak(floorSelectedPhrase(language, floor), language);
    dispatch({ type: "SELECT_FLOOR", floor });
  }

  function pressOpenDoor() {
    dispatch({ type: "PRESS_OPEN_DOOR" });
  }

  function pressCloseDoor() {
    dispatch({ type: "PRESS_CLOSE_DOOR" });
  }

  return { state, dispatch, call, selectFloor, pressOpenDoor, pressCloseDoor };
}
