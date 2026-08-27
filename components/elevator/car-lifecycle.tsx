"use client";

import { useEffect } from "react";
import type { Dispatch } from "react";

import { pickRandomAutoDestination, randomAutoIdleDelayMs } from "./auto-traffic";
import {
  ALIGHTING_DOOR_WAIT_MS,
  DOOR_ANIMATION_MS,
  DOORS_OPEN_WAIT_MS,
  FLOOR_TRAVEL_MS,
} from "./constants";
import { formatFloorSpeech } from "./floor-format";
import { isCarTraveling } from "./machine";
import { playArrivalChime, speak } from "./guidance-sound";
import type { CarState, ElevatorAction } from "./types";

export interface CarLifecycleProps {
  car: CarState;
  carIndex: number;
  /** 아이가 지금 호출해 응답을 기다리거나 타고 있는 카인지. */
  isActive: boolean;
  /** 목적층 안내 음성에 쓰는, 아이가 서 있는 층. isActive일 때만 의미가 있다. */
  standingFloor: number;
  topFloor: number;
  bottomFloor: number;
  dispatch: Dispatch<ElevatorAction>;
}

/**
 * 카 한 대의 생애주기 타이머와 안내 소리를 담당하는, 화면에 아무것도
 * 그리지 않는 로직 컴포넌트.
 *
 * 대수가 가변적이라(1~6대) 훅 하나로 고정 개수의 useEffect를 두는 방식은
 * React 규칙상 쓸 수 없다. 대신 이 컴포넌트를 카 개수만큼 렌더링해서,
 * 카마다 독립된 타이머 인스턴스를 갖게 한다.
 *
 * 소리는 isActive일 때만 낸다 — 자율 운행 카가 동시에 여러 대 움직여도
 * 안내 음성이 겹치지 않게 하기 위해서다
 * (docs/specs/multi-elevator-dispatch/spec.md).
 */
export function CarLifecycle({
  car,
  carIndex,
  isActive,
  standingFloor,
  topFloor,
  bottomFloor,
  dispatch,
}: CarLifecycleProps) {
  // 단계에 처음 들어설 때 한 번만 일어나는 안내 소리와 대기 타이머.
  useEffect(() => {
    switch (car.phase) {
      case "pickupDoorsOpen": {
        if (isActive) {
          playArrivalChime();
          speak("문이 열립니다");
        }
        const timer = window.setTimeout(
          () => dispatch({ type: "BOARDING_TIMEOUT", carIndex }),
          DOORS_OPEN_WAIT_MS
        );
        return () => window.clearTimeout(timer);
      }
      case "boardingDoorsOpen":
      case "closeCountdown": {
        // 목적층을 고르지 않고 방치해도(boardingDoorsOpen), 골라서 기다리는
        // 중이어도(closeCountdown) 시간이 지나면 저절로 닫히기 시작한다.
        const timer = window.setTimeout(
          () => dispatch({ type: "AUTO_CLOSE_TIMEOUT", carIndex }),
          DOORS_OPEN_WAIT_MS
        );
        return () => window.clearTimeout(timer);
      }
      case "doorsClosing": {
        if (isActive) speak("문이 닫힙니다");
        const timer = window.setTimeout(
          () => dispatch({ type: "DOORS_CLOSED", carIndex }),
          DOOR_ANIMATION_MS
        );
        return () => window.clearTimeout(timer);
      }
      case "travelingToDestination": {
        if (isActive && car.travelDirection) {
          speak(car.travelDirection === "up" ? "올라갑니다" : "내려갑니다");
        }
        return;
      }
      case "destinationDoorsOpen": {
        if (isActive) {
          playArrivalChime();
          speak(`${formatFloorSpeech(standingFloor)}입니다`);
          speak("문이 열립니다");
        }
        const timer = window.setTimeout(
          () => dispatch({ type: "ALIGHTED", carIndex }),
          DOORS_OPEN_WAIT_MS
        );
        return () => window.clearTimeout(timer);
      }
      case "alightingDoorsOpen": {
        // 아이가 이미 내렸거나(활성 카) 가상의 승객이 내린 뒤라(자율 운행 카)
        // 별도 조작 없이 저절로 닫힌다.
        if (isActive) speak("문이 닫힙니다");
        const timer = window.setTimeout(
          () => dispatch({ type: "ALIGHTING_DOORS_TIMEOUT", carIndex }),
          ALIGHTING_DOOR_WAIT_MS
        );
        return () => window.clearTimeout(timer);
      }
      case "idle": {
        // 응답 중인 카는 idle일 수 없지만(불변식), 방어적으로 건너뛴다.
        if (isActive) return;
        // 자율 운행: 잠시 대기했다가 무작위 층으로 스스로 출발한다.
        const delay = randomAutoIdleDelayMs();
        const timer = window.setTimeout(() => {
          const destinationFloor = pickRandomAutoDestination(car.carFloor, topFloor, bottomFloor);
          dispatch({ type: "AUTO_DEPART", carIndex, destinationFloor });
        }, delay);
        return () => window.clearTimeout(timer);
      }
      default:
        return;
    }
    // car.carFloor는 의도적으로 뺐다 — 이동 중(travelingToDestination)에는
    // ADVANCE_CAR가 한 층씩 지날 때마다 carFloor를 바꾸는데, 이 effect가
    // carFloor에 반응하면 phase는 그대로인데도 매 층 재실행되어 안내
    // 음성이 층마다 반복 재생된다. idle 분기가 참조하는 car.carFloor는
    // idle 진입 시점에 캡처된 값으로 충분하다 — idle 동안은 카가 멈춰
    // 있어 carFloor가 바뀌지 않는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    car.phase,
    car.travelDirection,
    carIndex,
    isActive,
    standingFloor,
    topFloor,
    bottomFloor,
    dispatch,
  ]);

  // 이동 중에는 한 층 지날 때마다 다음 한 층을 다시 예약한다.
  useEffect(() => {
    if (!isCarTraveling(car.phase)) return;
    const timer = window.setTimeout(() => dispatch({ type: "ADVANCE_CAR", carIndex }), FLOOR_TRAVEL_MS);
    return () => window.clearTimeout(timer);
  }, [car.phase, car.carFloor, carIndex, dispatch]);

  return null;
}
