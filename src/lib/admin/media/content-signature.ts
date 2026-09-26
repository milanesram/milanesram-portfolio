export type DetectedUploadType = "jpeg" | "png" | "webp" | "avif" | "pdf";

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] as const;

function matchesAt(bytes: Uint8Array, offset: number, expected: readonly number[]): boolean {
  if (bytes.length < offset + expected.length) {
    return false;
  }

  return expected.every((value, index) => bytes[offset + index] === value);
}

function readUint32(bytes: Uint8Array, offset: number, littleEndian: boolean): number | null {
  if (bytes.length < offset + 4) {
    return null;
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return view.getUint32(offset, littleEndian);
}

function ascii(bytes: Uint8Array, offset: number, length: number): string | null {
  if (bytes.length < offset + length) {
    return null;
  }

  let value = "";

  for (let index = 0; index < length; index += 1) {
    value += String.fromCharCode(bytes[offset + index]);
  }

  return value;
}

function isPng(bytes: Uint8Array): boolean {
  return bytes.length >= 33 && matchesAt(bytes, 0, PNG_SIGNATURE) && ascii(bytes, 12, 4) === "IHDR";
}

function isJpeg(bytes: Uint8Array): boolean {
  return bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

function isWebp(bytes: Uint8Array): boolean {
  if (ascii(bytes, 0, 4) !== "RIFF" || ascii(bytes, 8, 4) !== "WEBP") {
    return false;
  }

  const size = readUint32(bytes, 4, true);
  return size != null && size >= 4 && size + 8 <= bytes.length;
}

function isPdf(bytes: Uint8Array): boolean {
  return bytes.length >= 8 && ascii(bytes, 0, 5) === "%PDF-";
}

function isAvif(bytes: Uint8Array): boolean {
  if (ascii(bytes, 4, 4) !== "ftyp") {
    return false;
  }

  const boxSize = readUint32(bytes, 0, false);

  if (boxSize == null || boxSize < 16 || boxSize > bytes.length) {
    return false;
  }

  for (let offset = 8; offset + 4 <= boxSize; offset += 4) {
    const brand = ascii(bytes, offset, 4);

    if (brand === "avif" || brand === "avis") {
      return true;
    }
  }

  return false;
}

export function detectUploadContent(bytes: Uint8Array): DetectedUploadType | null {
  if (isPng(bytes)) {
    return "png";
  }

  if (isJpeg(bytes)) {
    return "jpeg";
  }

  if (isWebp(bytes)) {
    return "webp";
  }

  if (isAvif(bytes)) {
    return "avif";
  }

  if (isPdf(bytes)) {
    return "pdf";
  }

  return null;
}
