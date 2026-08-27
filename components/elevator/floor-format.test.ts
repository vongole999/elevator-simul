import { describe, expect, it } from "vitest";

import { formatFloorLabel, formatFloorSpeech, formatFloorWord } from "./floor-format";

describe("formatFloorLabel", () => {
  it("지상층은 숫자 그대로 표시한다", () => {
    expect(formatFloorLabel(4)).toBe("4");
  });

  it("지하층은 B로 표시한다", () => {
    expect(formatFloorLabel(-2)).toBe("B2");
  });
});

describe("formatFloorWord", () => {
  it("지상층은 층을 붙인다", () => {
    expect(formatFloorWord(4)).toBe("4층");
  });

  it("지하층은 표기 자체가 층을 뜻하므로 붙이지 않는다", () => {
    expect(formatFloorWord(-2)).toBe("B2");
  });
});

describe("formatFloorSpeech", () => {
  it("한국어 지상층은 '4층'으로 읽는다", () => {
    expect(formatFloorSpeech(4, "ko")).toBe("4층");
  });

  it("한국어 지하층은 '지하 2층'으로 읽는다", () => {
    expect(formatFloorSpeech(-2, "ko")).toBe("지하 2층");
  });

  it("영어 지상층은 'Floor 4'로 읽는다", () => {
    expect(formatFloorSpeech(4, "en")).toBe("Floor 4");
  });

  it("영어 지하층은 'Basement 2'로 읽는다", () => {
    expect(formatFloorSpeech(-2, "en")).toBe("Basement 2");
  });
});
