/**
 * 안내 소리 재생.
 *
 * 브라우저 내장 음성합성(Web Speech API)과 Web Audio API로 낸다.
 * 근거는 docs/decisions/guidance-sound.md를 따른다.
 *
 * 두 API 모두 테스트 환경(jsdom)이나 지원하지 않는 브라우저에는 없을 수
 * 있으므로, 없으면 조용히 아무 일도 하지 않는다.
 */
import type { Language } from "./types";

type AudioContextConstructor = typeof AudioContext;

function getAudioContextConstructor(): AudioContextConstructor | undefined {
  if (typeof window === "undefined") return undefined;
  return (
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: AudioContextConstructor })
      .webkitAudioContext
  );
}

let sharedAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  const Ctor = getAudioContextConstructor();
  if (!Ctor) return null;
  if (!sharedAudioContext) {
    sharedAudioContext = new Ctor();
  }
  return sharedAudioContext;
}

/**
 * 사용자 클릭(호출 버튼) 핸들러 안에서 미리 불러 오디오 컨텍스트를
 * 깨워 둔다. 브라우저 자동재생 정책상 사용자 제스처 없이 소리를 낼 수
 * 없기 때문이다.
 */
export function primeGuidanceAudio(): void {
  const ctx = getAudioContext();
  if (ctx && ctx.state === "suspended") {
    void ctx.resume();
  }
}

/** 도착을 알리는 두 음짜리 종소리를 합성해 재생한다. */
export function playArrivalChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [880, 659.25]; // 라 → 미, 실제 도착음과 비슷한 하강 2음
  notes.forEach((frequency, index) => {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;

    const start = now + index * 0.28;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.3, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);

    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.5);
  });
}

const LANGUAGE_TAGS: Record<Language, string> = {
  ko: "ko-KR",
  en: "en-US",
};

function pickVoice(synth: SpeechSynthesis, languageTag: string): SpeechSynthesisVoice | undefined {
  const voices = synth.getVoices();
  const shortTag = languageTag.split("-")[0];
  return (
    voices.find((voice) => voice.lang === languageTag) ??
    voices.find((voice) => voice.lang.startsWith(shortTag))
  );
}

/** 안내 문구를 언어에 맞는 음성으로 읽는다. 언어를 생략하면 한국어다. */
export function speak(text: string, language: Language = "ko"): void {
  if (typeof window === "undefined") return;
  const synth = window.speechSynthesis;
  if (!synth) return;

  const languageTag = LANGUAGE_TAGS[language];
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = languageTag;
  const voice = pickVoice(synth, languageTag);
  if (voice) utterance.voice = voice;

  synth.speak(utterance);
}
