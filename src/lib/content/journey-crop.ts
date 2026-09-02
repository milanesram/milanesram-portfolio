const JOURNEY_OBJECT_POSITION: Record<string, string> = {
  "21cc6ca2-a169-4d81-9e9f-c2b28142926f": "object-[center_28%]",
  "a9c3d301-8e83-490f-97f2-077b16f98844": "object-center",
  "d2f89c64-e6de-42bc-b697-952ad6791d36": "object-[42%_center]",
  "7e8a240a-d83f-47e5-9986-7882509b5a63": "object-[center_32%]",
  "c524fb45-e73e-4a1d-917c-a0287f07fedb": "object-[center_30%]",
};

export function journeyObjectPosition(mediaAssetId: string): string {
  return JOURNEY_OBJECT_POSITION[mediaAssetId] ?? "object-center";
}
