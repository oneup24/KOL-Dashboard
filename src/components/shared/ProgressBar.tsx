interface ProgressBarProps {
  value: number;
  className?: string;
}

const ProgressBar = ({ value, className = "" }: ProgressBarProps) => {
  const clamped = Math.max(0, Math.min(100, value));
  const isComplete = clamped >= 100;
  return (
    <div className={`w-full bg-slate-200 rounded-full h-1.5 ${className}`}>
      <div
        className={`h-1.5 rounded-full transition-all ${isComplete ? "bg-emerald-500" : "bg-blue-500"}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
};

export default ProgressBar;
