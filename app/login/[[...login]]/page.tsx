import { SignIn } from "@clerk/nextjs";

const appearance = {
  variables: {
    colorPrimary: "#20A39E",
    colorBackground: "#FFFFFF",
    borderRadius: "12px",
    fontFamily: "inherit",
  },
};

export default function LoginPage() {
  return (
    <main className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-background px-4 py-12">
      <SignIn appearance={appearance} />
    </main>
  );
}
