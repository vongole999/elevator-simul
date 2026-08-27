/**
 * 언어별 음성 안내 문구.
 *
 * 한 바퀴 곳곳(car-lifecycle.tsx, use-elevator.ts)에서 speak()에 넘길
 * 문구를 여기 모아 둔다. 언어가 하나뿐일 때는 호출부에 문자열을 직접 써도
 * 됐지만, 언어마다 두 벌씩 필요해지면서 한 곳에 모으지 않으면 새 언어를
 * 추가하거나 문구를 고칠 때 여러 파일을 빠짐없이 고쳐야 한다
 * (docs/specs/english-guidance-voice/spec.md).
 */
import { formatFloorSpeech } from "./floor-format";
import type { Direction, Language } from "./types";

/** 문이 열린다는 안내. */
export function doorsOpeningPhrase(language: Language): string {
  return language === "en" ? "Doors opening" : "문이 열립니다";
}

/** 문이 닫힌다는 안내. */
export function doorsClosingPhrase(language: Language): string {
  return language === "en" ? "Doors closing" : "문이 닫힙니다";
}

/** 이동 방향 안내. */
export function travelDirectionPhrase(language: Language, direction: Direction): string {
  if (language === "en") return direction === "up" ? "Going up" : "Going down";
  return direction === "up" ? "올라갑니다" : "내려갑니다";
}

/** 목적층 도착 안내. */
export function arrivalPhrase(language: Language, floor: number): string {
  const floorSpeech = formatFloorSpeech(floor, language);
  return language === "en" ? `Arriving at ${floorSpeech}` : `${floorSpeech}입니다`;
}

/**
 * 층 버튼을 눌렀을 때의 안내. 층 이름만 짧게 말하고 동작("눌렀습니다"/
 * "selected" 등)은 붙이지 않는다(2026-08-28 피드백으로 확정).
 */
export function floorSelectedPhrase(language: Language, floor: number): string {
  return formatFloorSpeech(floor, language);
}
