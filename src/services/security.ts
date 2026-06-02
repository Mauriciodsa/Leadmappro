export async function hashAccessCode(code: string) {
  const data = new TextEncoder().encode(code.trim());
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function saveAdminCode(code: string) {
  if (!code.trim()) return;
  localStorage.setItem('leadmap:admin-code-hash', await hashAccessCode(code));
}

export async function validateAdminCode(code: string) {
  const savedHash = localStorage.getItem('leadmap:admin-code-hash');
  if (!savedHash) return false;
  return (await hashAccessCode(code)) === savedHash;
}
