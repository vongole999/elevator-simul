import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("저장된 건물이 없으면 건물 설정 화면부터 보인다", async ({ page }) => {
  await expect(page).toHaveTitle("엘리베이터 시뮬레이터");
  await expect(page.getByRole("heading", { name: "건물 만들기" })).toBeVisible();
  await expect(page.getByRole("button", { name: "시작" })).toBeVisible();
});

test("시작을 누르면 그 건물의 1층 로비에서 시작한다", async ({ page }) => {
  await page.getByRole("button", { name: "시작" }).click();

  await expect(page.getByRole("heading", { name: "엘리베이터" })).toBeVisible();
  await expect(page.getByRole("button", { name: /위로 호출/ })).toBeVisible();
});

test("호출 버튼을 누르면 문이 열리고, 잠시 뒤 안쪽 시점으로 바뀐다", async ({ page }) => {
  await page.getByRole("button", { name: "시작" }).click();
  await page.getByRole("button", { name: /위로 호출/ }).click();

  // 카가 이미 1층에 있으므로 곧바로 도착해 문이 열린다.
  await expect(page.getByRole("img", { name: "문이 열려 있습니다" })).toBeVisible();

  // 승차 대기(4초 안팎)가 끝나면 화면이 캐빈 안쪽 시점으로 바뀐다.
  // 타임아웃을 넉넉히 두는 이유는 기다림 자체가 아니라, 여러 e2e 테스트가
  // 동시에 브라우저를 띄울 때 생기는 리소스 경합을 흡수하기 위해서다.
  await expect(page.getByText("엘리베이터 안")).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole("button", { name: "2층 버튼" })).toBeVisible();
});

test("설정을 마치고 새로고침해도 설정 화면 없이 그 건물이 그대로 유지된다", async ({ page }) => {
  await page.getByRole("button", { name: "지상 층수 늘리기" }).click();
  await page.getByRole("button", { name: "시작" }).click();
  await expect(page.getByRole("heading", { name: "엘리베이터" })).toBeVisible();

  await page.reload();

  await expect(page.getByRole("heading", { name: "엘리베이터" })).toBeVisible();
  // 11층까지 늘렸던 설정이 이어졌다면 최상층 호출 버튼도 있어야 한다.
  await expect(page.getByRole("button", { name: /위로 호출/ })).toBeVisible();
});

test("로비의 설정 버튼을 누르면 지난 값이 그대로인 설정 화면으로 돌아간다", async ({ page }) => {
  await page.getByRole("button", { name: "지상 층수 늘리기" }).click();
  await page.getByRole("button", { name: "시작" }).click();

  await page.getByRole("button", { name: "건물 설정으로 돌아가기" }).click();

  await expect(page.getByRole("heading", { name: "건물 만들기" })).toBeVisible();
  await expect(page.getByText("11")).toBeVisible();
});
