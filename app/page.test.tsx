import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import Home from "@/app/page";

test("홈 화면은 테마 프리뷰 제목과 버튼 컴포넌트를 보여준다", () => {
  render(<Home />);

  expect(
    screen.getByRole("heading", { level: 1, name: /Theme Preview/i })
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "default" })
  ).toBeInTheDocument();
});
