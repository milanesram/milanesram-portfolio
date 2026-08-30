export type BoundedBodyResult =
  | { ok: true; text: string }
  | { ok: false; status: 400 | 413 };

export async function readBoundedText(
  request: Request,
  maxBytes = 12_288,
): Promise<BoundedBodyResult> {
  const declaredRaw = request.headers.get("content-length");

  if (declaredRaw != null && declaredRaw !== "") {
    if (!/^\d+$/.test(declaredRaw)) {
      return { ok: false, status: 400 };
    }

    if (Number(declaredRaw) > maxBytes) {
      return { ok: false, status: 413 };
    }
  }

  if (!request.body) {
    return { ok: true, text: "" };
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  try {
    for (;;) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      if (!value || value.byteLength === 0) {
        continue;
      }

      received += value.byteLength;

      if (received > maxBytes) {
        await reader.cancel().catch(() => undefined);
        return { ok: false, status: 413 };
      }

      chunks.push(value);
    }
  } catch {
    return { ok: false, status: 400 };
  }

  if (received === 0) {
    return { ok: true, text: "" };
  }

  const merged = new Uint8Array(received);
  let offset = 0;

  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return { ok: true, text: new TextDecoder().decode(merged) };
}
