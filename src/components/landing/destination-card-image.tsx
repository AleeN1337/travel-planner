"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";

type Props = {
  src: string;
  alt: string;
  priority?: boolean;
};

export function DestinationCardImage({ src, alt, priority = false }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted/80 text-muted-foreground"
        role="img"
        aria-label={alt}
      >
        <ImageIcon className="size-8 opacity-50" aria-hidden />
        <span className="px-4 text-center text-xs">Zdjęcie niedostępne</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes="(max-width: 640px) 92vw, 360px"
      className="object-cover"
      onError={() => setFailed(true)}
    />
  );
}
