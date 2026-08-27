import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { BuildingSetupScreen } from "./building-setup-screen";
import { DEFAULT_BUILDING_CONFIG } from "./constants";

describe("BuildingSetupScreen", () => {
  it("지상 층수 늘리기 버튼을 누르면 숫자가 하나 올라간다", () => {
    render(<BuildingSetupScreen initialConfig={DEFAULT_BUILDING_CONFIG} onStart={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: "지상 층수 늘리기" }));

    expect(screen.getByText("11")).toBeInTheDocument();
  });

  it("지하 층수는 최솟값(0)에서 줄이기 버튼이 비활성화된다", () => {
    render(<BuildingSetupScreen initialConfig={DEFAULT_BUILDING_CONFIG} onStart={() => {}} />);

    expect(screen.getByRole("button", { name: "지하 층수 줄이기" })).toBeDisabled();
  });

  it("지상 층수는 최댓값(30)에서 늘리기 버튼이 비활성화된다", () => {
    render(
      <BuildingSetupScreen
        initialConfig={{ ...DEFAULT_BUILDING_CONFIG, topFloor: 30 }}
        onStart={() => {}}
      />
    );

    expect(screen.getByRole("button", { name: "지상 층수 늘리기" })).toBeDisabled();
  });

  it("분위기 카드를 고르면 그 카드가 선택된 채로 표시된다", () => {
    render(<BuildingSetupScreen initialConfig={DEFAULT_BUILDING_CONFIG} onStart={() => {}} />);

    fireEvent.click(screen.getByRole("radio", { name: "우주선" }));

    expect(screen.getByRole("radio", { name: "우주선" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "모던" })).toHaveAttribute("aria-checked", "false");
  });

  it("시작 버튼을 누르면 지금까지 고른 값 그대로 onStart가 불린다", () => {
    const onStart = vi.fn();
    render(<BuildingSetupScreen initialConfig={DEFAULT_BUILDING_CONFIG} onStart={onStart} />);

    fireEvent.click(screen.getByRole("button", { name: "지상 층수 늘리기" }));
    fireEvent.click(screen.getByRole("radio", { name: "클래식" }));
    fireEvent.click(screen.getByRole("radio", { name: "English" }));
    fireEvent.click(screen.getByRole("button", { name: "시작" }));

    expect(onStart).toHaveBeenCalledWith({
      topFloor: 11,
      bottomFloor: 0,
      theme: "classic",
      language: "en",
    });
  });
});
