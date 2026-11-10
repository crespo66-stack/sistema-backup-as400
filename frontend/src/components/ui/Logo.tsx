type LogoSize = "sm" | "md" | "lg";

const SIZES: Record<LogoSize, { icon: number; text: string; gap: string }> = {
  sm: { icon: 26, text: "text-[10px]", gap: "mt-0.5" },
  md: { icon: 40, text: "text-xs", gap: "mt-1.5" },
  lg: { icon: 60, text: "text-lg", gap: "mt-3" },
};

// Cubo (caja abierta) dibujado con líneas
export function CubeIcon({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={3.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M32 8 L52.8 20 L52.8 44 L32 56 L11.2 44 L11.2 20 Z" />
      <path d="M32 25.3 L32 8" />
      <path d="M26.2 35.4 L11.2 44" />
      <path d="M37.8 35.4 L52.8 44" />
    </svg>
  );
}

// Logo: cubo con el texto AS400 debajo
export default function Logo({
  size = "md",
  showText = true,
  className = "",
}: {
  size?: LogoSize;
  showText?: boolean;
  className?: string;
}) {
  const s = SIZES[size];
  return (
    <div className={`inline-flex flex-col items-center text-white ${className}`}>
      <CubeIcon size={s.icon} />
      {showText && (
        <span className={`${s.text} ${s.gap} font-semibold tracking-[0.3em] pl-[0.3em] leading-none`}>
          AS400
        </span>
      )}
    </div>
  );
}