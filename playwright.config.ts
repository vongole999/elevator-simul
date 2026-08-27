import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://localhost:3000";

// 브라우저가 이미 설치된 환경(예: Claude Code 원격 세션)에서는
// PLAYWRIGHT_CHROMIUM_PATH로 실행 파일을 직접 지정한다.
// 로컬에서는 비워 두고 `bunx playwright install chromium`으로 내려받는다.
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH;

export default defineConfig({
  testDir: "./e2e",
  testMatch: /.*\.spec\.ts$/,
  fullyParallel: true,
  // 로컬에서는 브라우저 창을 한꺼번에 너무 많이 띄우면 이 환경에서 세션이
  // 끊기며 실패하는 경우가 있어 동시 실행 수를 낮춘다. CI는 기본값을 쓴다.
  workers: process.env.CI ? undefined : 2,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          ...(executablePath ? { executablePath } : {}),
          // 여러 테스트가 동시에 브라우저 창을 띄우면 포커스를 못 받은 창의
          // setTimeout이 크게 느려진다(Chrome의 백그라운드 탭 스로틀링).
          // 앱의 안내 타이머(4초 등)가 실제보다 훨씬 늦게 발동해 테스트가
          // 흔들리므로, 이 스로틀링을 꺼서 병렬 실행에서도 실제 타이밍대로 돈다.
          args: [
            "--disable-background-timer-throttling",
            "--disable-backgrounding-occluded-windows",
            "--disable-renderer-backgrounding",
          ],
        },
      },
    },
  ],
  webServer: {
    command: "bun run dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
