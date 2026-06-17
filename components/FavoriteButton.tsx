"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";

interface FavoriteButtonProps {
  provider: string;
  externalId: string;
  initialFavorited?: boolean;
}

export function FavoriteButton({ provider, externalId, initialFavorited = false }: FavoriteButtonProps) {
  const { isSignedIn } = useUser();
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [showPrompt, setShowPrompt] = useState(false);

  async function handleClick() {
    if (!isSignedIn) {
      setShowPrompt(true);
      return;
    }

    setIsFavorited((prev) => !prev);

    if (!isFavorited) {
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, externalId }),
      });
    } else {
      await fetch(`/api/favorites/${provider}/${externalId}`, { method: "DELETE" });
    }
  }

  return (
    <>
      <button
        data-testid="favorite-btn"
        aria-pressed={isFavorited}
        aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
        onClick={handleClick}
      >
        {isFavorited ? "♥" : "♡"}
      </button>
      {showPrompt && (
        <span data-testid="sign-in-prompt">Sign in to save favorites</span>
      )}
    </>
  );
}
