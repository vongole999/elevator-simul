import { AUTO_IDLE_MAX_WAIT_MS, AUTO_IDLE_MIN_WAIT_MS } from "./constants";

/** 최상층부터 1층, 그다음 지하 1층부터 최하층까지, 건물에 있는 모든 층 번호(0층 제외). */
function buildingFloors(topFloor: number, bottomFloor: number): number[] {
  const floors: number[] = [];
  for (let floor = topFloor; floor >= 1; floor--) floors.push(floor);
  for (let floor = -1; floor >= -bottomFloor; floor--) floors.push(floor);
  return floors;
}

/**
 * 자율 운행 카가 다음으로 향할 층을 무작위로 고른다. 지금 있는 층은
 * 이동할 곳이 아니므로 후보에서 뺀다.
 */
export function pickRandomAutoDestination(
  currentFloor: number,
  topFloor: number,
  bottomFloor: number
): number {
  const candidates = buildingFloors(topFloor, bottomFloor).filter((floor) => floor !== currentFloor);
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/** 자율 운행 카가 idle 상태에서 다음 출발까지 기다리는 시간(ms)을 무작위로 고른다. */
export function randomAutoIdleDelayMs(): number {
  return AUTO_IDLE_MIN_WAIT_MS + Math.random() * (AUTO_IDLE_MAX_WAIT_MS - AUTO_IDLE_MIN_WAIT_MS);
}
