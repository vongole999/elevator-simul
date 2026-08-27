import { cn } from "@/lib/utils";

interface RiderProps {
  /** 지금 문 앞에 사람이 보여야 하는지. false면 문 안쪽으로 사라진 것처럼(탑승 완료) 투명해진다. */
  visible: boolean;
  color: string;
}

/**
 * 문 앞에서 타고 내리는 손님 한 명. 성별을 특정하지 않는 단순한 실루엣
 * 픽토그램이다.
 *
 * visible 하나만으로 구동한다 — pickupDoorsOpen(태우러 옴)에서 나타나
 * boardingDoorsOpen(탑승)으로 넘어가며 사라지고, alightingDoorsOpen(하차)에서
 * 다시 나타난다. 사라질 때는 문 안쪽으로 살짝 들어간 것처럼 축소·상승시켜
 * "탄다"는 느낌을 준다.
 */
export function Rider({ visible, color }: RiderProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute bottom-[6%] left-1/2 w-[16%] -translate-x-1/2 transition-all duration-700 ease-in-out",
        visible ? "translate-y-0 scale-100 opacity-100" : "translate-y-[10%] scale-75 opacity-0"
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 48" className="w-full drop-shadow-[0_2px_3px_rgba(0,0,0,0.35)]">
        <circle cx="12" cy="7" r="6" fill={color} />
        <path
          d="M12 15 C5 15 2.5 21 2.5 29 L2.5 46 C2.5 47.1 3.4 48 4.5 48 L19.5 48 C20.6 48 21.5 47.1 21.5 46 L21.5 29 C21.5 21 19 15 12 15 Z"
          fill={color}
        />
      </svg>
    </div>
  );
}
