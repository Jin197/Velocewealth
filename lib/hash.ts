/**
 * SHA-256 in the browser via Web Crypto.
 * Used to chain maintenance entries → tamper-evident "carnet certifié".
 * Falls back to a non-cryptographic hash on the server (only used during SSR
 * for placeholder display; the real chain is built client-side).
 */
export async function sha256(input: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const buf = new TextEncoder().encode(input);
    const digest = await window.crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // Fallback: simple hash, only for SSR placeholder
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return (h >>> 0).toString(16).padStart(16, '0');
}

export function shortHash(hash: string, len = 8): string {
  return hash.slice(0, len) + '…' + hash.slice(-4);
}
