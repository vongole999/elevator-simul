/**
 * 층 번호를 화면에 보여줄 문구로 바꾼다.
 *
 * 지하는 B1, B2…로 표시한다. 근거는 docs/decisions/floor-numbering.md에
 * 있다.
 */
export function formatFloorLabel(floor: number): string {
  return floor > 0 ? String(floor) : `B${-floor}`;
}

/** 안내 음성에서 층을 읽는 방식. "지하 2층입니다"처럼 자연스럽게 읽도록 표기와 다르게 둔다. */
export function formatFloorSpeech(floor: number): string {
  return floor > 0 ? `${floor}층` : `지하 ${-floor}층`;
}

/**
 * 화면 문구에서 층을 가리키는 낱말. 지상층은 "1층"처럼 "층"을 붙이고,
 * 지하는 표기 자체(B1)가 이미 층을 뜻하므로 붙이지 않는다.
 * 헤더 타이틀·로비 안내문처럼 문장 안에 자연스럽게 넣는 곳에서 쓴다.
 */
export function formatFloorWord(floor: number): string {
  const label = formatFloorLabel(floor);
  return floor > 0 ? `${label}층` : label;
}
