import { describe, expect, it } from "vitest";

import {
  arrivalPhrase,
  doorsClosingPhrase,
  doorsOpeningPhrase,
  floorSelectedPhrase,
  travelDirectionPhrase,
} from "./guidance-phrases";

describe("doorsOpeningPhrase", () => {
  it("한국어로 문이 열린다고 안내한다", () => {
    expect(doorsOpeningPhrase("ko")).toBe("문이 열립니다");
  });

  it("영어로 문이 열린다고 안내한다", () => {
    expect(doorsOpeningPhrase("en")).toBe("Doors opening");
  });
});

describe("doorsClosingPhrase", () => {
  it("한국어로 문이 닫힌다고 안내한다", () => {
    expect(doorsClosingPhrase("ko")).toBe("문이 닫힙니다");
  });

  it("영어로 문이 닫힌다고 안내한다", () => {
    expect(doorsClosingPhrase("en")).toBe("Doors closing");
  });
});

describe("travelDirectionPhrase", () => {
  it("한국어 상행은 '올라갑니다'다", () => {
    expect(travelDirectionPhrase("ko", "up")).toBe("올라갑니다");
  });

  it("한국어 하행은 '내려갑니다'다", () => {
    expect(travelDirectionPhrase("ko", "down")).toBe("내려갑니다");
  });

  it("영어 상행은 'Going up'이다", () => {
    expect(travelDirectionPhrase("en", "up")).toBe("Going up");
  });

  it("영어 하행은 'Going down'이다", () => {
    expect(travelDirectionPhrase("en", "down")).toBe("Going down");
  });
});

describe("arrivalPhrase", () => {
  it("한국어는 '4층입니다'처럼 안내한다", () => {
    expect(arrivalPhrase("ko", 4)).toBe("4층입니다");
  });

  it("한국어 지하층은 '지하 2층입니다'처럼 안내한다", () => {
    expect(arrivalPhrase("ko", -2)).toBe("지하 2층입니다");
  });

  it("영어는 'Arriving at Floor 4'처럼 안내한다", () => {
    expect(arrivalPhrase("en", 4)).toBe("Arriving at Floor 4");
  });

  it("영어 지하층은 'Arriving at Basement 2'처럼 안내한다", () => {
    expect(arrivalPhrase("en", -2)).toBe("Arriving at Basement 2");
  });
});

describe("floorSelectedPhrase", () => {
  it("한국어는 층 이름만 짧게 말한다(동작을 함께 말하지 않는다)", () => {
    expect(floorSelectedPhrase("ko", 4)).toBe("4층");
  });

  it("영어도 층 이름만 짧게 말한다", () => {
    expect(floorSelectedPhrase("en", 4)).toBe("Floor 4");
  });
});
