"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { CabinScene } from "./cabin-scene";
import { LobbyScene } from "./lobby-scene";
import type { ElevatorTheme } from "./theme";
import { useElevator } from "./use-elevator";

export interface ElevatorAppProps {
  /** 이 건물의 지상 층수. */
  topFloor: number;
  /** 이 건물의 지하 층수(0이면 지하 없음). */
  bottomFloor: number;
  /** 엘리베이터 인테리어 분위기. */
  theme: ElevatorTheme;
  /** 로비에서 설정 버튼을 눌렀을 때. */
  onOpenSettings: () => void;
}

/**
 * 엘리베이터 한 바퀴 시뮬레이터의 공개 진입점.
 *
 * 호출부터 하차까지 상태 기계는 useElevator가 굴리고, 이 컴포넌트는
 * 지금 시점(view)에 맞춰 로비/캐빈 화면을 조합해 보여주기만 한다.
 * topFloor·bottomFloor는 마운트 시점의 값으로 고정되므로, 건물을 바꿀
 * 때는 이 컴포넌트를 다시 마운트한다(예: 상위에서 key를 바꿔준다).
 */
export function ElevatorApp({ topFloor, bottomFloor, theme, onOpenSettings }: ElevatorAppProps) {
  const { state, call, selectFloor, pressOpenDoor, pressCloseDoor } = useElevator(
    topFloor,
    bottomFloor
  );

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex-row items-center justify-between">
        <h1 className="font-heading text-base font-medium">엘리베이터</h1>
        <Badge variant={state.view === "lobby" ? "secondary" : "default"}>
          {state.view === "lobby" ? "로비" : "탑승 중"}
        </Badge>
      </CardHeader>
      <CardContent className="flex items-center justify-center pt-2 pb-6">
        {state.view === "lobby" ? (
          <LobbyScene state={state} theme={theme} onCall={call} onOpenSettings={onOpenSettings} />
        ) : (
          <CabinScene
            state={state}
            theme={theme}
            onSelectFloor={selectFloor}
            onPressOpenDoor={pressOpenDoor}
            onPressCloseDoor={pressCloseDoor}
          />
        )}
      </CardContent>
    </Card>
  );
}
