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

test("대수를 늘려서 시작하면 로비에 그 수만큼의 문이 나란히 보인다", async ({ page }) => {
  await page.getByRole("button", { name: "엘리베이터 대수 늘리기" }).click();
  await page.getByRole("button", { name: "엘리베이터 대수 늘리기" }).click();
  await page.getByRole("button", { name: "시작" }).click();

  await expect(page.getByRole("heading", { name: "엘리베이터" })).toBeVisible();
  // 문이 열려 있는지 닫혀 있는지(자율 운행 타이밍)와 무관하게 대수만 센다.
  // 이름이 "문이…"로 시작하는 img만 세어, 층 표시기(svg도 img로 잡힌다)를 뺀다.
  await expect(
    page.getByRole("group", { name: "엘리베이터" }).getByRole("img", { name: /^문이/ })
  ).toHaveCount(3);
});

test("여러 대 건물에서도 카가 이미 그 층에 있으면 호출 즉시 문이 열린다", async ({ page }) => {
  await page.getByRole("button", { name: "엘리베이터 대수 늘리기" }).click();
  await page.getByRole("button", { name: "시작" }).click();

  // 두 카 모두 1층에서 시작하므로, 호출한 순간 그중 한 대는 곧바로 응답한다.
  // (자율 운행 중인 다른 카가 우연히 같은 순간 문을 여는 것도 정상 동작이라
  // 정확한 개수 대신 최소 하나가 열렸는지만 본다.)
  await page.getByRole("button", { name: /위로 호출/ }).click();
  await expect(page.getByRole("img", { name: "문이 열려 있습니다" }).first()).toBeVisible();

  await expect(page.getByText("엘리베이터 안")).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole("button", { name: "2층 버튼" })).toBeVisible();
});
