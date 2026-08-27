import { Button } from "@/components/ui/button";

import type { Language } from "./types";

const LANGUAGE_LABELS: Record<Language, string> = {
  ko: "한국어",
  en: "English",
};

const LANGUAGES: Language[] = ["ko", "en"];

interface LanguagePickerProps {
  value: Language;
  onChange: (language: Language) => void;
}

/** 안내 언어를 고른다. 실제 안내 음성은 아직 한국어로 고정이다(가정 참고). */
export function LanguagePicker({ value, onChange }: LanguagePickerProps) {
  return (
    <div className="flex gap-2" role="radiogroup" aria-label="안내 언어">
      {LANGUAGES.map((language) => (
        <Button
          key={language}
          type="button"
          variant={value === language ? "default" : "outline"}
          role="radio"
          aria-checked={value === language}
          onClick={() => onChange(language)}
        >
          {LANGUAGE_LABELS[language]}
        </Button>
      ))}
    </div>
  );
}
