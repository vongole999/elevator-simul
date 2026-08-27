import { expect, test } from "@playwright/test";

test("홈 화면이 열리고 1층 로비에서 호출 버튼이 보인다", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("엘리베이터 시뮬레이터");
  await expect(page.getByRole("heading", { name: "엘리베이터" })).toBeVisible();
  await expect(page.getByRole("button", { name: /위로 호출/ })).toBeVisible();
});

test("호출 버튼을 누르면 문이 열리고, 잠시 뒤 안쪽 시점으로 바뀐다", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /위로 호출/ }).click();

  // 카가 이미 1층에 있으므로 곧바로 도착해 문이 열린다.
  await expect(page.getByRole("img", { name: "문이 열려 있습니다" })).toBeVisible();

  // 승차 대기(4초 안팎)가 끝나면 화면이 캐빈 안쪽 시점으로 바뀐다.
  await expect(page.getByText("엘리베이터 안")).toBeVisible({ timeout: 8000 });
  await expect(page.getByRole("button", { name: "2" })).toBeVisible();
});
