import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import Home from "@/app/page";

test("홈 화면은 1층 로비에서 위로 호출 버튼만 보여준다", () => {
  render(<Home />);

  expect(screen.getByRole("heading", { name: "엘리베이터" })).toBeInTheDocument();
  expect(screen.getByText("로비")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /위로 호출/ })).toBeInTheDocument();
  // 최하층(1층)에서 시작하므로 아래로 호출하는 버튼은 없다.
  expect(screen.queryByRole("button", { name: /아래로 호출/ })).not.toBeInTheDocument();
});
