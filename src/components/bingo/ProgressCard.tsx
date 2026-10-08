import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface ProgressCardProps {
  completed: number;
  total: number;
  className?: string;
}

export function ProgressCard({ completed, total, className }: ProgressCardProps) {
  const percentage = Math.min(100, (completed / total) * 100);
  const remaining = Math.max(0, total - completed);

  return (
    <div className={cn("bg-white p-6 rounded-[24px] shadow-sm border border-neutral-100", className)}>
      <div className="flex justify-between items-end mb-4">
        <div>
          <h3 className="text-sm font-bold tracking-wider text-neutral-500 mb-1">YOUR PROGRESS</h3>
          <div className="text-3xl font-extrabold text-neutral-900">
            {completed} <span className="text-neutral-400 text-xl font-medium">/ {total}</span>
          </div>
        </div>
        <div className="text-sm font-semibold text-orange-500">
          {remaining > 0 ? `${remaining} more to go!` : "All done!"}
        </div>
      </div>
      <Progress value={percentage} className="h-3 bg-neutral-100 [&>div]:bg-gradient-to-r [&>div]:from-orange-400 [&>div]:to-orange-500" />
    </div>
  );
}
