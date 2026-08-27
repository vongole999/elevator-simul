import { useSyncExternalStore } from "react";

import { loadBuildingConfig, loadBuildingConfigServerSnapshot, subscribeBuildingConfig } from "./storage";
import type { BuildingConfig } from "./types";

/**
 * 브라우저에 저장된 건물 설정을 구독한다. 저장된 게 없으면 null.
 *
 * localStorage는 서버에 없으므로, 서버에서 그릴 때는 항상 null(저장된
 * 게 없음)로 취급하고 브라우저에서 실제 값으로 다시 그린다.
 */
export function useSavedBuildingConfig(): BuildingConfig | null {
  return useSyncExternalStore(
    subscribeBuildingConfig,
    loadBuildingConfig,
    loadBuildingConfigServerSnapshot
  );
}
