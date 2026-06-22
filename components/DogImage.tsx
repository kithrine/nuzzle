// Shows the whole dog photo (object-contain) so the face is never cropped,
// over a blurred, zoomed copy of the same photo so the frame still looks full.
// Renders two absolutely-positioned layers into a caller-provided
// `relative overflow-hidden` box.
export function DogImage({ src, alt }: { src: string; alt: string }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        style={{ filter: "blur(16px)", transform: "scale(1.1)" }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-contain"
      />
    </>
  );
}
