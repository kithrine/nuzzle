export function NuzzleLogo({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M18 3L4 9v10c0 8.28 6.04 16.02 14 18 7.96-1.98 14-9.72 14-18V9L18 3z"
        fill="#20A39E"
      />
      <path
        d="M18 12c-1.1 0-2 .9-2 2 0 .74.41 1.38 1 1.72V22h2v-6.28c.59-.34 1-.98 1-1.72 0-1.1-.9-2-2-2z"
        fill="white"
      />
      <path
        d="M14 18c0 .55.45 1 1 1s1-.45 1-1-.45-1-1-1-1 .45-1 1zM20 18c0 .55.45 1 1 1s1-.45 1-1-.45-1-1-1-1 .45-1 1z"
        fill="white"
      />
    </svg>
  );
}
