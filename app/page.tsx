import { ElevatorSimulator } from "@/components/elevator-simulator";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-muted/40 p-8">
      <ElevatorSimulator />
    </div>
  );
}
