import Image from "next/image";
import type { PublicImageMedia } from "@/lib/content/media";

type HomePortraitProps = {
  portrait: PublicImageMedia;
};

export function HomePortrait({ portrait }: HomePortraitProps) {
  return (
    <figure>
      <div className="relative aspect-[4/5] overflow-hidden bg-paper">
        <Image
          src={portrait.publicUrl}
          alt={portrait.altText}
          fill
          sizes="(min-width: 1024px) 23rem, 70vw"
          className="object-cover object-[center_18%]"
          preload
        />
      </div>
    </figure>
  );
}
