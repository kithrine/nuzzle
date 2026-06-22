import Image from "next/image";

// Brand logo (heart + paw + botanical accents). Decorative — the adjacent
// "Nuzzle" wordmark provides the accessible name, so this is aria-hidden.
export function NuzzleLogo({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/images/logo.png"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      priority
      className={className}
    />
  );
}
