import { SignUp } from "@clerk/nextjs";

const appearance = {
  variables: {
    colorPrimary: "#20A39E",
    colorBackground: "#FFFFFF",
    borderRadius: "12px",
    fontFamily: "inherit",
  },
};

export default function SignupPage() {
  return (
    <main className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-background px-4 py-12">
      <SignUp appearance={appearance} />
    </main>
  );
}
