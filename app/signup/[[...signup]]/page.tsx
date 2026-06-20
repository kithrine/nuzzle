import { SignUp } from "@clerk/nextjs";
import Image from "next/image";
import { NuzzleLogo } from "@/components/layout/NuzzleLogo";

const appearance = {
  variables: {
    colorPrimary: "#20A39E",
    colorBackground: "#FFFFFF",
    borderRadius: "12px",
    fontFamily: "inherit",
  },
  elements: {
    card: "shadow-xl",
  },
};

export default function SignupPage() {
  return (
    <main className="relative flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] overflow-hidden bg-background px-4 py-12">
      <Image
        src="/images/login-bg.png"
        alt=""
        aria-hidden="true"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="relative z-10 flex flex-col items-center">
        <div className="flex items-center gap-2">
          <NuzzleLogo size={36} />
          <span className="text-3xl font-bold text-primary">Nuzzle</span>
        </div>
        <p className="text-text-primary font-medium mt-1 mb-6">Better matches. Happier tails.</p>
        <SignUp appearance={appearance} />
      </div>
    </main>
  );
}
