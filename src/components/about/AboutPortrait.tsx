import Image from "next/image";
import type { PublicImageMedia } from "@/lib/content/media";

type AboutPortraitProps = {
  portrait: PublicImageMedia;
};

export function AboutPortrait({ portrait }: AboutPortraitProps) {
  return (
    <figure className="relative w-full max-w-[16rem] pb-3 pr-3 sm:max-w-[18rem]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-4 right-0 bottom-0 left-4 bg-accent"
      />
      <div className="relative border border-copper-decorative bg-paper p-1">
      <div className="relative aspect-[2/3] overflow-hidden bg-paper">
        <Image
          src={portrait.publicUrl}
          alt={portrait.altText}
          fill
          sizes="(min-width: 640px) 18rem, 16rem"
          className="object-cover object-[center_12%]"
        />
      </div>
      </div>
    </figure>
  );
}
