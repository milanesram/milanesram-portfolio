import Image from "next/image";
import type { PublicImageMedia } from "@/lib/content/media";

type AboutPortraitProps = {
  portrait: PublicImageMedia;
};

export function AboutPortrait({ portrait }: AboutPortraitProps) {
  return (
    <figure className="w-full max-w-[16rem] sm:max-w-[18rem]">
      <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-line bg-paper">
        <Image
          src={portrait.publicUrl}
          alt={portrait.altText}
          fill
          sizes="(min-width: 640px) 18rem, 16rem"
          className="object-cover object-[center_12%]"
        />
      </div>
    </figure>
  );
}
