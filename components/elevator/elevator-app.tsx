"use client";

import { Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { CabinScene } from "./cabin-scene";
import { CarLifecycle } from "./car-lifecycle";
import { formatFloorWord } from "./floor-format";
import { LobbyScene } from "./lobby-scene";
import type { ElevatorTheme } from "./theme";
import type { Language } from "./types";
import { useElevator } from "./use-elevator";

export interface ElevatorAppProps {
  /** 이 건물의 지상 층수. */
  topFloor: number;
  /** 이 건물의 지하 층수(0이면 지하 없음). */
  bottomFloor: number;
  /** 이 건물의 엘리베이터 대수(1~6대). */
  carCount: number;
  /** 엘리베이터 인테리어 분위기. */
  theme: ElevatorTheme;
  /** 안내 음성 언어. */
  language: Language;
  /** 로비에서 설정 버튼을 눌렀을 때. */
  onOpenSettings: () => void;
}

/**
 * 대수가 늘어날수록 로비에 나란히 보이는 문이 늘어나므로, 좁은 카드 폭에
 * 욱여넣지 않고 화면 가로 폭을 넉넉히 쓴다
 * (docs/specs/multi-elevator-dispatch/spec.md "정해진 제약과 이유").
 */
const CARD_MAX_WIDTH_CLASS: Record<number, string> = {
  1: "max-w-md",
  2: "max-w-2xl",
  3: "max-w-4xl",
  4: "max-w-5xl",
  5: "max-w-6xl",
  6: "max-w-7xl",
};

/**
 * 엘리베이터 시뮬레이터의 공개 진입점.
 *
 * 호출부터 하차까지, 그리고 배차·자율 운행까지 상태 기계는 useElevator가
 * 굴리고, 카마다 필요한 타이머와 안내 소리는 카 개수만큼 렌더링하는
 * CarLifecycle이 각자 담당한다. 이 컴포넌트는 지금 시점(view)에 맞춰
 * 로비/캐빈 화면을 조합해 보여주기만 한다.
 *
 * topFloor·bottomFloor·carCount는 마운트 시점의 값으로 고정되므로, 건물을
 * 바꿀 때는 이 컴포넌트를 다시 마운트한다(예: 상위에서 key를 바꿔준다).
 */
export function ElevatorApp({
  topFloor,
  bottomFloor,
  carCount,
  theme,
  language,
  onOpenSettings,
}: ElevatorAppProps) {
  const { state, dispatch, call, selectFloor, pressOpenDoor, pressCloseDoor } = useElevator(
    topFloor,
    bottomFloor,
    carCount,
    language
  );

  const activeCar = state.activeCarIndex !== null ? state.cars[state.activeCarIndex] : null;
  // 설정 화면으로 돌아가는 것은 호출을 기다리는 동안에만 허용한다 — 엘리베이터가
  // 응답하는 중에 건물을 바꾸면 진행 중이던 동작이 애매해진다
  // (docs/specs/building-setup/spec.md "가정").
  const canOpenSettings = state.view === "lobby" && state.activeCarIndex === null;
  const title = state.view === "lobby" ? `${formatFloorWord(state.standingFloor)} 로비` : "엘리베이터";
  // 로비는 대수만큼 늘어서는 문 개수에 맞춰 폭을 정하지만, 캐빈은 언제나
  // 카 1대만 보여준다. 대신 층 버튼이 최대 220개(지상 200+지하 20)까지
  // 늘어날 수 있으니, 대수와 무관하게 늘 넉넉한 폭을 써서 버튼이 가로로
  // 넓게 펼쳐지게 한다.
  const cardWidthClass =
    state.view === "cabin" ? "max-w-5xl" : (CARD_MAX_WIDTH_CLASS[carCount] ?? "max-w-5xl");

  return (
    <>
      {state.cars.map((car, index) => (
        <CarLifecycle
          key={index}
          car={car}
          carIndex={index}
          isActive={index === state.activeCarIndex}
          standingFloor={state.standingFloor}
          topFloor={topFloor}
          bottomFloor={bottomFloor}
          language={language}
          dispatch={dispatch}
        />
      ))}

      <Card className={cn("w-full", cardWidthClass)}>
        <CardHeader className="flex-row items-center justify-between">
          <h1 className="font-heading text-base font-medium">{title}</h1>
          {canOpenSettings && (
            <Button type="button" variant="outline" size="sm" onClick={onOpenSettings}>
              <Settings className="size-4" />
              설정
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex items-center justify-center pt-2 pb-4">
          {state.view === "lobby" ? (
            <LobbyScene
              cars={state.cars}
              standingFloor={state.standingFloor}
              topFloor={topFloor}
              bottomFloor={bottomFloor}
              activeCarIndex={state.activeCarIndex}
              callActive={state.callActive}
              theme={theme}
              onCall={call}
            />
          ) : (
            activeCar && (
              <CabinScene
                car={activeCar}
                carIndex={state.activeCarIndex ?? 0}
                topFloor={topFloor}
                bottomFloor={bottomFloor}
                theme={theme}
                onSelectFloor={selectFloor}
                onPressOpenDoor={pressOpenDoor}
                onPressCloseDoor={pressCloseDoor}
              />
            )
          )}
        </CardContent>
      </Card>
    </>
  );
}
