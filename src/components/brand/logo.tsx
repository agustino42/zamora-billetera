import { cn } from "@/lib/utils";

export function ZamoraLogo({
  className,
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient shadow-lg shadow-brand/30">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-5 w-5 text-white"
          aria-hidden
        >
          <path
            d="M5 5h14L9 19h10"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="18.5" cy="6" r="2.2" fill="currentColor" />
        </svg>
      </span>
      {showText && (
        <span className="font-display text-lg font-extrabold tracking-tight">
          Zamora
          <span className="text-brand">.</span>
        </span>
      )}
    </div>
  );
}
