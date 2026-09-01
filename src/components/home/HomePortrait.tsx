import Image from "next/image";
import type { PublicImageMedia } from "@/lib/content/media";

type HomePortraitProps = {
  portrait: PublicImageMedia;
};

export function HomePortrait({ portrait }: HomePortraitProps) {
  return (
    <figure className="mx-auto w-full max-w-xs lg:mx-0">
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-line bg-paper">
        <Image
          src={portrait.publicUrl}
          alt={portrait.altText}
          fill
          sizes="(min-width: 1024px) 16rem, 20rem"
          className="object-cover object-[center_18%]"
          preload
        />
      </div>
    </figure>
  );
}
