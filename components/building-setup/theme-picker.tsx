import { ELEVATOR_THEMES, type ElevatorTheme } from "@/components/elevator/theme";
import { cn } from "@/lib/utils";

const THEME_LABELS: Record<ElevatorTheme, string> = {
  modern: "모던",
  classic: "클래식",
  spaceship: "우주선",
};

const THEME_PREVIEW_CLASS: Record<ElevatorTheme, string> = {
  modern: "bg-gradient-to-br from-neutral-600 to-neutral-950",
  classic: "bg-gradient-to-br from-amber-700 to-stone-950",
  spaceship: "bg-gradient-to-br from-cyan-500 to-slate-950",
};

interface ThemePickerProps {
  value: ElevatorTheme;
  onChange: (theme: ElevatorTheme) => void;
}

/** 엘리베이터 인테리어 분위기를 카드 중 하나로 고른다. */
export function ThemePicker({ value, onChange }: ThemePickerProps) {
  return (
    <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="엘리베이터 분위기">
      {ELEVATOR_THEMES.map((theme) => (
        <button
          key={theme}
          type="button"
          role="radio"
          aria-checked={value === theme}
          onClick={() => onChange(theme)}
          className={cn(
            "flex flex-col items-center gap-2 rounded-2xl border-2 p-2 transition-colors",
            value === theme ? "border-primary" : "border-transparent hover:border-border"
          )}
        >
          <span
            className={cn("h-12 w-full rounded-lg", THEME_PREVIEW_CLASS[theme])}
            aria-hidden
          />
          <span className="text-sm font-medium">{THEME_LABELS[theme]}</span>
        </button>
      ))}
    </div>
  );
}
