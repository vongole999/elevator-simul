import { ELEVATOR_THEMES } from "@/components/elevator/theme";

import {
  MAX_BOTTOM_FLOOR,
  MAX_ELEVATOR_COUNT,
  MAX_TOP_FLOOR,
  MIN_BOTTOM_FLOOR,
  MIN_ELEVATOR_COUNT,
  MIN_TOP_FLOOR,
} from "./constants";
import type { BuildingConfig } from "./types";

const STORAGE_KEY = "elevator-simul:building-config";

type Listener = () => void;
const listeners = new Set<Listener>();

function notifyListeners(): void {
  listeners.forEach((listener) => listener());
}

/** 저장된 건물이 바뀔 때(같은 탭에서 저장했을 때) 다시 읽어야 하는 쪽이 구독한다. */
export function subscribeBuildingConfig(callback: Listener): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function isValidConfig(value: unknown): value is BuildingConfig {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;

  const { topFloor, bottomFloor, elevatorCount, theme, language } = candidate;
  return (
    typeof topFloor === "number" &&
    topFloor >= MIN_TOP_FLOOR &&
    topFloor <= MAX_TOP_FLOOR &&
    typeof bottomFloor === "number" &&
    bottomFloor >= MIN_BOTTOM_FLOOR &&
    bottomFloor <= MAX_BOTTOM_FLOOR &&
    typeof elevatorCount === "number" &&
    elevatorCount >= MIN_ELEVATOR_COUNT &&
    elevatorCount <= MAX_ELEVATOR_COUNT &&
    (ELEVATOR_THEMES as readonly unknown[]).includes(theme) &&
    (language === "ko" || language === "en")
  );
}

// useSyncExternalStore의 getSnapshot은 값이 실제로 안 바뀌었으면 같은 참조를
// 반환해야 한다. raw 문자열이 그대로면 지난번 파싱 결과를 그대로 돌려준다.
let cachedRaw: string | null = null;
let cachedConfig: BuildingConfig | null = null;

/** 지난번 만든 건물을 읽어온다. 없거나 읽을 수 없으면 null. */
export function loadBuildingConfig(): BuildingConfig | null {
  if (typeof window === "undefined") return null;

  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }
  if (raw === cachedRaw) return cachedConfig;

  cachedRaw = raw;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    cachedConfig = isValidConfig(parsed) ? parsed : null;
  } catch {
    cachedConfig = null;
  }
  return cachedConfig;
}

/** 서버에는 브라우저 저장소가 없으므로 항상 저장된 게 없는 것으로 그린다. */
export function loadBuildingConfigServerSnapshot(): BuildingConfig | null {
  return null;
}

/** 건물 설정을 저장한다. 저장 공간이 없거나 막혀 있으면 조용히 넘어간다. */
export function saveBuildingConfig(config: BuildingConfig): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // 다음에 열면 다시 설정 화면부터 시작하는 것으로 자연히 대체된다.
  }
  notifyListeners();
}
