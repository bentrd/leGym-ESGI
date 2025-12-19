"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

type ShareButtonProps = {
  challengeId: number;
  title: string;
};

export function ShareButton({ challengeId, title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/defis/${challengeId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Défi: ${title}`,
          text: `Rejoins-moi sur ce défi!`,
          url,
        });
        return;
      } catch (err) {
        console.error("Share failed:", err);
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Button size="sm" onClick={handleShare}>
      {copied ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Copié!
        </>
      ) : (
        <>
          <Share2 className="mr-2 h-4 w-4" />
          Partager
        </>
      )}
    </Button>
  );
}
