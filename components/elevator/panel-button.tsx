import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

import { getThemePalette, type ElevatorTheme } from "./theme";

interface PanelButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  active?: boolean;
  size?: "sm" | "md" | "lg";
  /** 분위기에 따라 버튼의 모양(원형·사각·육각)과 재질이 달라진다. 생략하면 모던 모양을 쓴다. */
  theme?: ElevatorTheme;
  className?: string;
  children: ReactNode;
}

const SIZE_CLASS: Record<NonNullable<PanelButtonProps["size"]>, string> = {
  sm: "size-9 text-sm",
  md: "size-11 text-base",
  lg: "size-14 text-lg",
};

/**
 * 분위기별 버튼 바깥 모양. 색은 팔레트에서 인라인 스타일로 주고, 여기서는
 * 테마마다 뚜렷이 다른 실루엣만 tailwind 클래스로 정한다.
 * - modern: 각진 스퀴클(rounded-xl) — 미니멀한 사각 터치 버튼.
 * - classic: 완전한 원형 — 볼록한 황동 버튼.
 * - spaceship: 육각형(clip-path) — 우주선 조작판 느낌.
 */
const THEME_SHAPE_CLASS: Record<ElevatorTheme, string> = {
  modern: "rounded-xl",
  classic: "rounded-full",
  spaceship: "rounded-lg [clip-path:polygon(25%_0,75%_0,100%_50%,75%_100%,25%_100%,0_50%)]",
};

/**
 * 실제 엘리베이터 조작판 버튼처럼 보이는 버튼.
 *
 * 평소엔 눌리지 않은 오목한 상태이고, active(눌려서 점등된 상태)면 분위기의
 * 포인트 색(sceneAccent)으로 빛난다. 호출 버튼과 층 버튼이 함께 쓴다.
 */
export function PanelButton({
  active,
  size = "md",
  theme = "modern",
  className,
  children,
  disabled,
  style,
  ...props
}: PanelButtonProps) {
  const palette = getThemePalette(theme);

  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "relative flex shrink-0 items-center justify-center border font-mono font-semibold transition-all duration-150",
        "disabled:cursor-not-allowed disabled:opacity-40",
        !disabled && "active:scale-[0.94]",
        SIZE_CLASS[size],
        THEME_SHAPE_CLASS[theme],
        active
          ? "border-transparent text-neutral-900 shadow-[0_0_16px_4px_var(--panel-glow),inset_0_1px_1px_rgba(255,255,255,0.7),inset_0_-2px_3px_rgba(0,0,0,0.35)]"
          : "border-black/10 text-neutral-800 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),inset_0_-2px_3px_rgba(0,0,0,0.35),0_1px_2px_rgba(0,0,0,0.45)]",
        className
      )}
      style={{
        ...style,
        "--panel-glow": `${palette.sceneAccent}a6`,
        background: active
          ? `radial-gradient(circle at 35% 28%, #fff8ec, ${palette.sceneAccent} 55%, ${palette.doorColorTo} 100%)`
          : `radial-gradient(circle at 35% 28%, #f4f4f5, #a1a1aa 60%, #6b7280 100%)`,
      } as React.CSSProperties}
      {...props}
    >
      {children}
    </button>
  );
}
