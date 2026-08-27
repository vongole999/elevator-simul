"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { CabinScene } from "./cabin-scene";
import { LobbyScene } from "./lobby-scene";
import { useElevator } from "./use-elevator";

/**
 * 엘리베이터 한 바퀴 시뮬레이터의 공개 진입점.
 *
 * 호출부터 하차까지 상태 기계는 useElevator가 굴리고, 이 컴포넌트는
 * 지금 시점(view)에 맞춰 로비/캐빈 화면을 조합해 보여주기만 한다.
 */
export function ElevatorApp() {
  const { state, call, selectFloor, pressOpenDoor, pressCloseDoor } = useElevator();

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
          <LobbyScene state={state} onCall={call} />
        ) : (
          <CabinScene
            state={state}
            onSelectFloor={selectFloor}
            onPressOpenDoor={pressOpenDoor}
            onPressCloseDoor={pressCloseDoor}
          />
        )}
      </CardContent>
    </Card>
  );
}
