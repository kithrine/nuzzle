"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

interface RemoveFavoriteButtonProps {
  provider: string;
  externalId: string;
  dogName?: string;
  className?: string;
}

export function RemoveFavoriteButton({
  provider,
  externalId,
  dogName,
  className,
}: RemoveFavoriteButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleRemove() {
    if (pending) return;
    setPending(true);
    try {
      await fetch(`/api/favorites/${provider}/${externalId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleRemove}
      disabled={pending}
      aria-label={`Remove ${dogName ?? "dog"} from favorites`}
      className={`text-text-secondary hover:text-text-primary disabled:opacity-50 transition-colors ${className ?? ""}`}
    >
      <X size={20} />
    </button>
  );
}
