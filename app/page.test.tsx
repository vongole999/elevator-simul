import { render, screen } from "@testing-library/react";
import { beforeEach, expect, test } from "vitest";

import Home from "@/app/page";

beforeEach(() => {
  window.localStorage.clear();
});

test("저장된 건물이 없으면 홈 화면은 건물 설정 화면을 보여준다", () => {
  render(<Home />);

  expect(screen.getByRole("heading", { name: "건물 만들기" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "시작" })).toBeInTheDocument();
});
