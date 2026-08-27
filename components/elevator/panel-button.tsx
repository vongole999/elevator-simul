import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PanelButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  active?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  children: ReactNode;
}

const SIZE_CLASS: Record<NonNullable<PanelButtonProps["size"]>, string> = {
  sm: "size-9 text-sm",
  md: "size-11 text-base",
  lg: "size-14 text-lg",
};

/**
 * 실제 엘리베이터 조작판 버튼처럼 보이는 원형 버튼.
 *
 * 평소엔 브러시드 메탈 느낌의 오목한 버튼이고, active(눌려서 점등된 상태)면
 * 호박색으로 빛난다. 호출 버튼과 층 버튼이 함께 쓴다.
 */
export function PanelButton({
  active,
  size = "md",
  className,
  children,
  disabled,
  ...props
}: PanelButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full border font-mono font-semibold transition-all duration-150",
        "disabled:cursor-not-allowed disabled:opacity-40",
        !disabled && "active:scale-[0.94]",
        SIZE_CLASS[size],
        active
          ? "border-amber-300/60 bg-[radial-gradient(circle_at_35%_28%,#fef3c7,#f59e0b_55%,#b45309_100%)] text-amber-950 shadow-[0_0_14px_3px_rgba(251,191,36,0.65),inset_0_1px_1px_rgba(255,255,255,0.7),inset_0_-2px_3px_rgba(0,0,0,0.35)]"
          : "border-neutral-400/40 bg-[radial-gradient(circle_at_35%_28%,#f4f4f5,#a1a1aa_60%,#6b7280_100%)] text-neutral-800 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),inset_0_-2px_3px_rgba(0,0,0,0.35),0_1px_2px_rgba(0,0,0,0.45)]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
