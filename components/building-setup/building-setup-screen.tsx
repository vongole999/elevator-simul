"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

import {
  MAX_BOTTOM_FLOOR,
  MAX_ELEVATOR_COUNT,
  MAX_TOP_FLOOR,
  MIN_BOTTOM_FLOOR,
  MIN_ELEVATOR_COUNT,
  MIN_TOP_FLOOR,
} from "./constants";
import { LanguagePicker } from "./language-picker";
import { StepperField } from "./stepper-field";
import { ThemePicker } from "./theme-picker";
import type { BuildingConfig } from "./types";

interface BuildingSetupScreenProps {
  /** 화면을 열 때 채워둘 값. 지난번 만든 건물이 있으면 그 값, 없으면 기본값. */
  initialConfig: BuildingConfig;
  onStart: (config: BuildingConfig) => void;
}

/** 아이가 층수·분위기·언어를 직접 정하는 건물 설정 화면. */
export function BuildingSetupScreen({ initialConfig, onStart }: BuildingSetupScreenProps) {
  const [config, setConfig] = useState(initialConfig);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <h1 className="font-heading text-base font-medium">건물 만들기</h1>
        <p className="text-sm text-muted-foreground">
          층수와 분위기를 정하고 엘리베이터 놀이를 시작하세요.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-wrap justify-center gap-x-10 gap-y-6">
          <StepperField
            label="지상 층수"
            value={config.topFloor}
            min={MIN_TOP_FLOOR}
            max={MAX_TOP_FLOOR}
            onChange={(topFloor) => setConfig((c) => ({ ...c, topFloor }))}
          />
          <StepperField
            label="지하 층수"
            value={config.bottomFloor}
            min={MIN_BOTTOM_FLOOR}
            max={MAX_BOTTOM_FLOOR}
            onChange={(bottomFloor) => setConfig((c) => ({ ...c, bottomFloor }))}
          />
          <StepperField
            label="엘리베이터 대수"
            value={config.elevatorCount}
            min={MIN_ELEVATOR_COUNT}
            max={MAX_ELEVATOR_COUNT}
            onChange={(elevatorCount) => setConfig((c) => ({ ...c, elevatorCount }))}
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">엘리베이터 분위기</span>
          <ThemePicker
            value={config.theme}
            onChange={(theme) => setConfig((c) => ({ ...c, theme }))}
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">안내 언어</span>
          <LanguagePicker
            value={config.language}
            onChange={(language) => setConfig((c) => ({ ...c, language }))}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button type="button" size="lg" className="w-full" onClick={() => onStart(config)}>
          시작
        </Button>
      </CardFooter>
    </Card>
  );
}
