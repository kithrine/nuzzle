import Link from "next/link";
import { Heart, SquarePen, Bell } from "lucide-react";

interface DashboardSidebarProps {
  firstName: string;
  active: "saved" | "profile";
}

const itemBase =
  "flex items-center gap-2 px-3 py-2 rounded-button-inline text-sm transition-colors";
const itemActive = "bg-primary-light text-primary font-medium";
const itemInactive = "text-text-secondary hover:bg-primary-light/50";

export function DashboardSidebar({ firstName, active }: DashboardSidebarProps) {
  return (
    <aside className="hidden md:block w-60 flex-shrink-0">
      <p className="text-text-primary font-semibold text-lg mb-6">Welcome back, {firstName}</p>
      <nav className="flex flex-col gap-1">
        {active === "saved" ? (
          <span className={`${itemBase} ${itemActive}`}>
            <Heart size={16} /> Saved Dogs
          </span>
        ) : (
          <Link href="/favorites" className={`${itemBase} ${itemInactive}`}>
            <Heart size={16} /> Saved Dogs
          </Link>
        )}

        {active === "profile" ? (
          <span className={`${itemBase} ${itemActive}`}>
            <SquarePen size={16} /> Edit Profile
          </span>
        ) : (
          <Link href="/questionnaire" className={`${itemBase} ${itemInactive}`}>
            <SquarePen size={16} /> Edit Profile
          </Link>
        )}

        <span className={`${itemBase} ${itemInactive}`}>
          <Bell size={16} /> Notification Preferences
        </span>
      </nav>
    </aside>
  );
}
