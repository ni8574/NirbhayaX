/**
 * Client-Side Cryptographic Hasher
 * Uses native Web Crypto API (SubtleCrypto) to calculate SHA-256 in the browser
 * before any byte is uploaded to the network.
 */

export async function computeClientSha256(fileOrBuffer) {
  let arrayBuffer;
  if (fileOrBuffer instanceof File || fileOrBuffer instanceof Blob) {
    arrayBuffer = await fileOrBuffer.arrayBuffer();
  } else if (fileOrBuffer instanceof ArrayBuffer) {
    arrayBuffer = fileOrBuffer;
  } else {
    // string or buffer
    const encoder = new TextEncoder();
    arrayBuffer = encoder.encode(String(fileOrBuffer)).buffer;
  }

  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Format bytes into human readable format
 */
export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

