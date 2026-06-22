"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Heart, Mail, Lock, Eye, EyeOff, UserRoundPlus } from "lucide-react";
import { NuzzleLogo } from "@/components/layout/NuzzleLogo";

// Filled-heart color (RULES Rule 13: pairs with aria-pressed, not color alone).
const FAVORITE_RED = "#EF4444";

interface FavoriteButtonProps {
  provider: string;
  externalId: string;
  initialFavorited?: boolean;
  dogName?: string;
  size?: number;
}

export function FavoriteButton({
  provider,
  externalId,
  initialFavorited = false,
  dogName,
  size = 22,
}: FavoriteButtonProps) {
  const { isSignedIn } = useUser();
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pop, setPop] = useState(false);

  async function handleClick() {
    if (!isSignedIn) {
      setShowPrompt(true);
      return;
    }

    const nowFavorited = !isFavorited;
    setIsFavorited(nowFavorited);
    if (nowFavorited) setPop(true); // play the pop only when favoriting

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

  const headingId = `save-favorite-heading-${provider}-${externalId}`;
  const name = dogName ?? "this dog";

  return (
    <>
      <button
        data-testid="favorite-btn"
        aria-pressed={isFavorited}
        aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
        onClick={handleClick}
        className="inline-flex items-center justify-center transition-colors hover:opacity-80"
      >
        <Heart
          size={size}
          fill={isFavorited ? FAVORITE_RED : "none"}
          color={isFavorited ? FAVORITE_RED : "currentColor"}
          className={pop ? "animate-heart-pop" : undefined}
          onAnimationEnd={() => setPop(false)}
        />
      </button>

      {showPrompt &&
        createPortal(
          <>
            {/* Dark overlay — tap to dismiss */}
            <div
              className="fixed inset-0 z-50 bg-black/50"
              onClick={() => setShowPrompt(false)}
            />

            {/* Bottom sheet */}
            <div
              data-testid="login-prompt"
              role="dialog"
              aria-modal="true"
              aria-labelledby={headingId}
              onClick={(e) => e.stopPropagation()}
              className="fixed bottom-0 left-0 right-0 z-50 bg-surface rounded-t-[20px] px-6 pt-6 pb-10 shadow-xl max-w-lg mx-auto"
            >
              {/* Drag handle */}
              <div className="w-12 h-1 bg-border rounded-full mx-auto mb-6" />

              {/* Logo + wordmark */}
              <div className="flex items-center justify-center gap-2">
                <NuzzleLogo size={28} />
                <span className="text-xl font-bold text-primary">Nuzzle</span>
              </div>

              <p
                id={headingId}
                className="text-text-primary text-xl font-bold text-center mt-4"
              >
                Save {name} to your favorites
              </p>
              <p className="text-text-secondary text-sm text-center mt-2 mb-6">
                Create a free account to save your matches and come back anytime.
              </p>

              {/* Email (visual only) */}
              <div className="relative">
                <Mail
                  size={18}
                  aria-hidden="true"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
                />
                <input
                  type="email"
                  placeholder="Email address"
                  className="border border-border rounded-button-inline px-4 py-3 pl-11 w-full text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              {/* Password (visual only) */}
              <div className="relative mt-3">
                <Lock
                  size={18}
                  aria-hidden="true"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="border border-border rounded-button-inline px-4 py-3 pl-11 pr-11 w-full text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-text-secondary text-xs mt-1">
                Password must be at least 8 characters.
              </p>

              {/* Create Account → /signup */}
              <Link
                href="/signup"
                className="bg-primary text-white rounded-button-full w-full py-3 font-semibold mt-4 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <UserRoundPlus size={18} aria-hidden="true" />
                Create Account
              </Link>

              {/* Maybe Later — dismiss */}
              <button
                type="button"
                onClick={() => setShowPrompt(false)}
                className="text-text-secondary text-sm font-medium text-center mt-3 w-full"
              >
                Maybe Later
              </button>
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
