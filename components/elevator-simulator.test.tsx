import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { saveBuildingConfig } from "@/components/building-setup/storage";

import { ElevatorSimulator } from "./elevator-simulator";

beforeEach(() => {
  window.localStorage.clear();
});

describe("ElevatorSimulator", () => {
  it("저장된 건물이 없으면 설정 화면부터 보여준다", () => {
    render(<ElevatorSimulator />);

    expect(screen.getByRole("heading", { name: "건물 만들기" })).toBeInTheDocument();
  });

  it("설정 화면에서 시작하면 그 건물의 로비가 되고, 설정이 저장된다", () => {
    render(<ElevatorSimulator />);

    fireEvent.click(screen.getByRole("button", { name: "시작" }));

    // 새 건물은 항상 지상 1층에서 시작하므로(single-elevator-round-trip spec), 헤더도 "1층 로비"다.
    expect(screen.getByRole("heading", { name: "1층 로비" })).toBeInTheDocument();
    expect(window.localStorage.getItem("elevator-simul:building-config")).not.toBeNull();
  });

  it("저장된 건물이 있으면 설정 화면 없이 곧바로 그 건물에서 시작한다", () => {
    saveBuildingConfig({ topFloor: 15, bottomFloor: 2, elevatorCount: 1, theme: "spaceship", language: "en" });

    render(<ElevatorSimulator />);

    // 저장된 건물도 1층 로비에서 시작한다.
    expect(screen.getByRole("heading", { name: "1층 로비" })).toBeInTheDocument();
    // 15층 건물이니 최상층 호출 버튼이 나온다(BOTTOM_FLOOR 기반 판정이 아니라
    // 저장된 topFloor가 실제로 반영됐는지 확인하는 것).
    expect(screen.getByRole("button", { name: /위로 호출/ })).toBeInTheDocument();
  });

  it("로비에서 설정 버튼을 누르면 다시 설정 화면으로 돌아가고 지난 값이 채워져 있다", () => {
    saveBuildingConfig({ topFloor: 12, bottomFloor: 1, elevatorCount: 3, theme: "classic", language: "ko" });
    render(<ElevatorSimulator />);

    fireEvent.click(screen.getByRole("button", { name: "설정" }));

    expect(screen.getByRole("heading", { name: "건물 만들기" })).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "클래식" })).toHaveAttribute("aria-checked", "true");
  });
});
