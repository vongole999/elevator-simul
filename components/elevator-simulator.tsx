"use client";

import { useState } from "react";

import { BuildingSetupScreen } from "@/components/building-setup/building-setup-screen";
import { DEFAULT_BUILDING_CONFIG } from "@/components/building-setup/constants";
import { saveBuildingConfig } from "@/components/building-setup/storage";
import { useSavedBuildingConfig } from "@/components/building-setup/use-saved-building-config";
import { ElevatorApp } from "@/components/elevator/elevator-app";

/**
 * 건물 설정과 엘리베이터 게임을 조합하는 앱의 공개 진입점.
 *
 * 브라우저에 저장된 건물이 있으면 곧바로 그 건물의 로비에서 시작하고,
 * 없으면 설정 화면부터 보여준다. 두 화면은 서로를 모르며, 조합은 이
 * 컴포넌트가 맡는다.
 */
export function ElevatorSimulator() {
  const savedConfig = useSavedBuildingConfig();
  // 저장된 건물이 있어도 로비의 설정 버튼으로 다시 설정 화면을 열 수 있다.
  const [reopenedSetup, setReopenedSetup] = useState(false);

  if (savedConfig === null || reopenedSetup) {
    return (
      <BuildingSetupScreen
        initialConfig={savedConfig ?? DEFAULT_BUILDING_CONFIG}
        onStart={(config) => {
          saveBuildingConfig(config);
          setReopenedSetup(false);
        }}
      />
    );
  }

  return (
    <ElevatorApp
      // 건물이 바뀔 때마다 게임을 처음부터 다시 시작하도록 새로 마운트한다.
      key={`${savedConfig.topFloor}-${savedConfig.bottomFloor}-${savedConfig.elevatorCount}-${savedConfig.theme}-${savedConfig.language}`}
      topFloor={savedConfig.topFloor}
      bottomFloor={savedConfig.bottomFloor}
      carCount={savedConfig.elevatorCount}
      theme={savedConfig.theme}
      language={savedConfig.language}
      onOpenSettings={() => setReopenedSetup(true)}
    />
  );
}
